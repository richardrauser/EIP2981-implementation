const { expect } = require('chai');
const { deployments, ethers } = require('hardhat');

describe('ERC721WithRoyalties', () => {
    let ERC721WithRoyalties;
    let deployer;
    let royaltiesRecipient;

    const ADDRESS_ZERO = ethers.constants.AddressZero;

    beforeEach(async () => {
        [deployer, randomAccount, royaltiesRecipient] =
            await ethers.getSigners();

        await deployments.fixture();
        ERC721WithRoyalties = await deployments.get('ERC721WithRoyalties');
        erc721WithRoyalties = await ethers.getContractAt(
            'ERC721WithRoyalties',
            ERC721WithRoyalties.address,
            deployer,
        );
    });

    describe('Royalties', async () => {
        it('throws if royalties more than 100%', async function () {
            const tx = erc721WithRoyalties.mint(
                deployer.address,
                royaltiesRecipient.address,
                10001, // 100.01%
            );

            await expect(tx).to.be.revertedWith('ERC2981Royalties: Too high');
        });

        it('has the right royalties for tokenId', async function () {
            await erc721WithRoyalties.mint(
                deployer.address,
                royaltiesRecipient.address,
                250, // 2.50%
            );

            const info = await erc721WithRoyalties.royaltyInfo(0, 10000);
            expect(info[1].toNumber()).to.be.equal(250);
            expect(info[0]).to.be.equal(royaltiesRecipient.address);
        });

        it('can set address(0) as royalties recipient', async function () {
            // 0.01% royalties
            await erc721WithRoyalties.mint(deployer.address, ADDRESS_ZERO, 1);

            const info = await erc721WithRoyalties.royaltyInfo(0, 10000);
            expect(info[1].toNumber()).to.be.equal(1);
            expect(info[0]).to.be.equal(ADDRESS_ZERO);
        });

        it('has no royalties if not set', async function () {
            await erc721WithRoyalties.mint(
                deployer.address,
                royaltiesRecipient.address,
                0,
            );

            const info = await erc721WithRoyalties.royaltyInfo(0, 100);
            expect(info[1].toNumber()).to.be.equal(0);
            expect(info[0]).to.be.equal(ADDRESS_ZERO);
        });
    });
});
