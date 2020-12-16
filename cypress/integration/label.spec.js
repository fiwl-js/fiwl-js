/// <reference types="cypress" />

import Chance from 'chance';

const chance = Chance();

describe('Label', () => {
    const email = chance.email();
    const name = chance.name();

    it('has a title', () => {
        cy.contains('User Info');
    })
})