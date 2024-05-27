import { createStore } from 'vuex'
const ethers = require("ethers")
const jsprovider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/BAg7VHxXrlaHOdZZ_oYITAuFbvebX8E9")

import { multisigABI } from '@/contracts/Multisig.abi.js'
import { targetABI } from '@/contracts/Target.abi.js'

export default createStore({
    state: {
        provider : {},
        address: "",
        chainId: "",
        admins: ['0x61553cdBB96cfb235be23f466399D119125C5B42', '0xb8DB1e5204012bA53e503f6C6B2ad54Dead498dc', '0xBeED64c44dd4527378276a55454Ab9bD2713bbB9'],
        admin: false,
        multisigAddress: '0x8c7011Aed42fA1C0A3F0A490806222A5e574e5b4',
        multisig: {},
        // targetAddress: '0xD9Dc96e1Eb540eF1ceCBC6098FeEa63c7943f8B9',
        target: {},
        message: {},
        newMessage: false,
        enoughSignatures: false
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        async connectionWallet({state}){
            // проверяем, что есть метамаск и подключаем его
            if (typeof window.ethereum !== 'undefined') {
                console.log("Ethereum client installed!")
                if (ethereum.isMetaMask === true) {
                    console.log("Metamask installed!")
                    if (ethereum.isConnected() !== true) {
                        console.log("Metamask is not connected!")
                        await ethereum.enable()
                    }
                    console.log("Metamask connected!")
                }
                else{
                    alert("Metamask is not installed!")
                }
            }
            else{
                alert("Ethereum client is not installed!")
            }

            // подключаем аккаунт
            await ethereum.request({method: "eth_requestAccounts"})
            .then(accounts => {
                state.address = ethers.getAddress(accounts[0])
                if (state.admins.includes(state.address)) {
                    state.admin = true
                }
                else {
                    state.admin = false
                }
                console.log(`Account ${state.address} connected`)
            })
            
            // создаём провайдера
            state.provider = new ethers.WebSocketProvider(ethereum)
            // получаем параметры сети 
            state.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log("chainId: ", state.chainId )

            ethereum.on('accountsChanged', (accounts) => {
                state.address = ethers.getAddress(accounts[0])
                if (state.admins.includes(state.address)) {
                    state.admin = true
                }
                else {
                    state.admin = false
                }
                console.log(`accounts changed to ${state.address }`)
            })

            ethereum.on('chainChanged', async (chainId) => {
                // создаём провайдера
                state.provider = new ethers.providers.Web3Provider(ethereum)
                // получаем параметры сети 
                state.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log(`chainId changed to ${state.chainId}`)
            })
        },
        async newMessage({state}, args) {
            const [targetAddress, functionName, functionArgs] = args
            console.log(functionName)
            console.log(functionArgs.args)

            // functionArgs = {
            //     types: [],
            //     args: []
            // }

            // Собираем сигнатуру целевой функции
            console.log(functionArgs.types)
            let functionSignature = 'function ' + functionName + '('
            for(let i = 0; i < functionArgs.types.length; i++) {
                functionSignature += functionArgs.types[i] + ','
            }
            functionSignature = functionSignature.slice(0, -1) + ')'

            console.log("functionSignature: ", functionSignature)

            // Собираем интерфейс целевого контракта
            const iTarget = new ethers.Interface([functionSignature])

            console.log("iTarget: ", iTarget)

            // Собираем calldata
            const payload = iTarget.encodeFunctionData(functionName, functionArgs.args)

            console.log("payload: ", payload)
            

            // Начинаем собирать сообщение по кусочкам

            // Получаем nonce
            // Предварительно получая объект провайдера и инстанс контракта
            // const provider = ethers.getDefaultProvider(Number(ethers.toBigInt(state.chainId)))
            state.multisig = new ethers.Contract(state.multisigAddress, multisigABI, jsprovider)

            const nonce = await state.multisig.nonce()

            console.log("nonce: ", nonce)

            // Все необходимое есть, теперь собираем само сообщение 
            const message = ethers.toBeArray(ethers.solidityPacked(
                ['uint256', 'address', 'address', 'bytes'],
                [nonce, state.multisigAddress, targetAddress, payload]
            ))

            const signer = state.provider.getSigner()

            // Подписываем сообщение
            const rawSignature = await signer.signMessage(message)

            // Вытаскиваем саму подпись
            const signature = ethers.Signature.from(rawSignature)

            // Вытаскиваем v r s и добавляем в структуру с массивами

            let signatures = {
                v: [signature.v],
                r: [signature.r],
                s: [signature.s]
            }

            // Сохраняем параметры сообщения на подпись 
            // и сами подписи
            state.message = {
                targetAddress: targetAddress,
                functionName: functionName,
                functionArgs: functionArgs,
                nonce: nonce,
                payload: payload,
                message: message,
                signers: state.address,
                signatures: signatures
            }

            // говорим, что есть новое сообщение
            state.newMessage = true
        },
        async signMessage({state}, args) {
            const signer = state.provider.getSigner()

            // Подписываем сообщение
            const rawSignature = await signer.signMessage(state.message.message)

            // Вытаскиваем саму подпись
            const signature = ethers.Signature.from(rawSignature)

            // Добавляем его подписи к уже имеющимся
            state.message.signatures.v.push(signature.v)
            state.message.signatures.r.push(signature.r)
            state.message.signatures.s.push(signature.s)
            state.message.signers.push(signer.address)

            console.log("New sign: ", signer.address)
            console.log("Sign count: ", state.message.signers.length)

            if (state.message.signers.length > state.admins.length / 2) {
                console.log("Enough signatures")
                state.enoughSignatures = true
            }
        },
        async sendMessage({state}) {
            const iMultisig = new ethers.Interface(multisigABI)

            // Собираем calldata для функции verify
            const data = iMultisig.encodeFunctionData("verify",
                [
                    state.message.nonce,
                    state.message.targetAddress,
                    state.message.payload,
                    state.message.signatures.v,
                    state.message.signatures.r,
                    state.message.signatures.s,
                ]
            )

            // Отправляем транзакцию
            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: {
                    from: state.address,
                    to: state.multisigAddress,
                    data: data
                }
            })

            console.log("txHash: ", txHash)

            // Ждем квитанцию
            const provider = ethers.getDefaultProvider(Number(ethers.toBigInt(state.chainId)))
            const receipt = await provider.waitForTransaction(txHash)
            console.log("receipt: ", receipt)

            const target = new ethers.Contract(state.message.targetAddress, targetABI, provider)
            const number = await target.number()
            console.log("number: ", number)

            state.newMessage = false
            state.enoughSignatures = false
        }
    },
    modules: {
    }
})