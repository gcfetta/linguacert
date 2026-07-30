export const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "language",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "level",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "sessionsCompleted",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "sessionHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "CertificateIssued",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_language",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_level",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_sessionsCompleted",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "_sessionHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "_ipfsCid",
				"type": "string"
			}
		],
		"name": "issueCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "language",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "level",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "sessionsCompleted",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "sessionHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_student",
				"type": "address"
			}
		],
		"name": "getCertificateCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_student",
				"type": "address"
			}
		],
		"name": "getCertificates",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "student",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "language",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "level",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "sessionsCompleted",
						"type": "uint256"
					},
					{
						"internalType": "bytes32",
						"name": "sessionHash",
						"type": "bytes32"
					},
					{
						"internalType": "string",
						"name": "ipfsCid",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct LinguaCert.Certificate[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];