// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Multisig {

    mapping(address => bool) admins;
    uint256 adminsCount;
    uint256 public _nonce;

    event Verify(bool success);
    event DebugSignCount(uint256 signCount);

    constructor(address[] memory _admins) {
        adminsCount = _admins.length;
        for (uint256 i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
    }

    function verify(uint256 nonce, address target, bytes calldata payload, uint8[] calldata v, bytes32[] calldata r, bytes32[] calldata s) public payable returns(uint256) {
        // Проверяем nonce
        require(nonce == _nonce, "Bad nonce");

        // Проверяем размеры массимов
        require(v.length == r.length && r.length == s.length, "Wrong size of arrays");

        // Получаем хеш сообщения из исходных данных
        bytes32 messageHash = getMessageHash(nonce, target, payload);
        _nonce++;

        // Получаем количество правильных подписей
        uint256 signCount = _verify(messageHash, v, r, s);

        // Проверяем сколько админов подписало сообщение
        require(signCount  > adminsCount / 2, "Not enough signatures");

        // Теперь совершаем низкоуровневый вызов
        bool success = LowLevelCall(target, payload, msg.value);

        emit Verify(success);
        return signCount;
    }

    // Это функция для сборки сообщения из исходных данных
    function getMessageHash(uint256 nonce, address target, bytes calldata payload) internal view returns(bytes32) {
        bytes memory message = abi.encodePacked(nonce, address(this), target, payload);
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes memory digest = abi.encodePacked(prefix, toBytes(message.length), message);
        return keccak256(digest);
    }

    function toBytes(uint256 number) internal pure returns(bytes memory) {
        uint256 temp = number;
        uint256 digits = 0;
        do { 
            temp /= 10;
            digits++;
        } while (temp != 0);
        bytes memory buffer = new bytes(digits);
        while (number != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(number % 10)));
            number /= 10;
        }
        return buffer;
    }

    function _verify(bytes32 hash, uint8[] calldata v, bytes32[] calldata r, bytes32[] calldata s) internal returns(uint256){
        // Количество админов, которые подписали это сообщение
        uint256 signCount;

        // массив админов, которые подписали сообщение
        address[] memory adrs = new address[](v.length);

        for (uint256 i = 0; i < v.length; i++) {
            // Восстанавливаем очередной адрес
            address adr = ecrecover(hash, v[i], r[i], s[i]);

            // Проверяем есть ли этот адрес среди админов
            if (admins[adr]) {
                bool check = true;
                // Перебираем адерса тех, кто уже подписался и смотрим есть ли там адрес adr
                // Если нет то добавляем
                for (uint256 j = 0; j < signCount; j++) {
                    if (adr == adrs[j]) {
                        check = false;
                        break;
                    }
                }
                if (check) {
                    adrs[signCount] = adr;
                    signCount++;
                }
            }
        }
        emit DebugSignCount(signCount);
        return signCount;
    }

    function LowLevelCall(address target, bytes calldata payload, uint256 value) internal returns(bool){
        (bool success,) = target.call{value: value}(payload);
        require(success, "Not successfully call");
        return success;
    }
}