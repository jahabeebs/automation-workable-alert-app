// We are using the ABI of Oracle Job in this example: https://etherscan.io/address/0xe717Ec34b2707fc8c226b34be5eae8482d06ED03
export const jobABI = `[{"inputs":[{"internalType":"address","name":"_sequencer","type":"address"},{"internalType":"address","name":"_ilkRegistry","type":"address"},{"internalType":"address","name":"_spotter","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes32","name":"network","type":"bytes32"}],"name":"NotMaster","type":"error"},{"inputs":[],"name":"NotSuccessful","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"network","type":"bytes32"},{"indexed":false,"internalType":"bytes32[]","name":"toPoke","type":"bytes32[]"},{"indexed":false,"internalType":"bytes32[]","name":"spotterIlksToPoke","type":"bytes32[]"},{"indexed":false,"internalType":"uint256","name":"numSuccessful","type":"uint256"}],"name":"Work","type":"event"},{"inputs":[],"name":"ilkRegistry","outputs":[{"internalType":"contract IlkRegistryLike","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sequencer","outputs":[{"internalType":"contract SequencerLike","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"spotter","outputs":[{"internalType":"contract SpotterLike","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"vat","outputs":[{"internalType":"contract VatLike","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"network","type":"bytes32"},{"internalType":"bytes","name":"args","type":"bytes"}],"name":"work","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"network","type":"bytes32"}],"name":"workable","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"nonpayable","type":"function"}]`;
