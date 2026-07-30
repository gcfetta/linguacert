// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LinguaCert {
    struct Certificate {
        address student;
        string language;
        string level;
        uint256 sessionsCompleted;
        bytes32 sessionHash;   // hash de las conversaciones que avalan este certificado
        string ipfsCid;        // CID de IPFS donde está el JSON completo de las conversaciones
        uint256 timestamp;
    }

    mapping(address => Certificate[]) public certificates;

    event CertificateIssued(
        address indexed student,
        string language,
        string level,
        uint256 sessionsCompleted,
        bytes32 sessionHash,
        string ipfsCid,
        uint256 timestamp
    );

    function issueCertificate(
        string memory _language,
        string memory _level,
        uint256 _sessionsCompleted,
        bytes32 _sessionHash,
        string memory _ipfsCid
    ) public {
        Certificate memory cert = Certificate({
            student: msg.sender,
            language: _language,
            level: _level,
            sessionsCompleted: _sessionsCompleted,
            sessionHash: _sessionHash,
            ipfsCid: _ipfsCid,
            timestamp: block.timestamp
        });

        certificates[msg.sender].push(cert);

        emit CertificateIssued(
            msg.sender,
            _language,
            _level,
            _sessionsCompleted,
            _sessionHash,
            _ipfsCid,
            block.timestamp
        );
    }

    function getCertificates(address _student)
        public
        view
        returns (Certificate[] memory)
    {
        return certificates[_student];
    }

    // Devuelve cuántos certificados tiene una wallet
    function getCertificateCount(address _student)
        public
        view
        returns (uint256)
    {
        return certificates[_student].length;
    }
}
