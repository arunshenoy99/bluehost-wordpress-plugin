// <reference types="Cypress" />

describe('Settings Page', () => {

	before(() => {

		// Make sure caching is disabled by default
		cy.exec('npx wp-env run cli wp option set endurance_cache_level 0');

		cy.visit('/wp-admin/admin.php?page=bluehost#/settings');
	});

	const fn = {
		validateToggle(label, run = 0) {
			cy.intercept('POST', /bluehost(\/|%2F)v1(\/|%2F)settings/).as('update');
			cy.findByLabelText(label).as('toggle');
			cy.get('@toggle').scrollIntoView().should('exist');
			cy.get('@toggle').next().scrollIntoView().should('be.visible');
			cy.get('@toggle').then(($toggle) => {
				if ($toggle.attr('aria-checked') !== 'true') {
					// If unchecked, check it
					cy.get('@toggle').check();
					cy.wait('@update', {timeout: 12000});
					cy.get('@toggle').should('have.attr', 'aria-checked', 'true');
				} else {
					// If checked, uncheck it
					cy.get('@toggle').uncheck();
					cy.wait('@update', {timeout: 12000});
					cy.get('@toggle').should('have.attr', 'aria-checked', 'false');
				}
			});
			// Do the inverse as well
			if (!run) {
				this.validateToggle(label, run + 1);
			}
		},
		validateSelect(label, values) {
			cy.intercept('POST', /bluehost(\/|%2F)v1(\/|%2F)settings/).as('update');
			cy.get(`select[aria-label="${label}"]`).as('select');
			cy.get('@select').scrollIntoView().should('be.visible');
			values.forEach((value) => {
				cy.get('@select').select(`${value}`);
				cy.wait('@update', {timeout: 12000});
				cy.get('@select').should('have.value', `${value}`);
			});
		},
	};

	it('Exists', () => {
		cy.get('.settings-section').should('have.length', 5);
	});

	it('Is Accessible', () => {
		cy.injectAxe();
		cy.wait(1000);
		cy.checkA11y('.bwa-route-contents');
	});

	it('Has an "Automatic Updates" section', () => {
		cy.get('.settings-section').first().within(() => {
			cy.contains('h3', 'Automatic Updates');
		});
	});

	it('Automatic Updates: WordPress Core', () => {
		fn.validateToggle('WordPress Core');
	});

	it('Automatic Updates: Themes', () => {
		fn.validateToggle('Themes');
	});

	it('Automatic Updates: Plugins', () => {
		fn.validateToggle('Plugins');
	});

	it('Has a "Site Controls" section', () => {
		cy.get('.settings-section').eq(1).within(() => {
			cy.contains('h3', 'Site Controls');
		});
	});

	it('Site Controls: Coming Soon', () => {
		fn.validateToggle('Coming Soon Page');
	});

	it('Has a "Comments" section', () => {
		cy.get('.settings-section').eq(2).within(() => {
			cy.contains('h3', 'Comments');
		});
	});

	it('Comments: Close After x Days', () => {
		fn.validateSelect('Close comments after x days', [7, 28]);
	});

	it('Comments: Show x Per Page', () => {
		fn.validateSelect('Display x comments per page', [20, 10]);
	});

	it('Comments: Disable for old posts', () => {
		fn.validateToggle('Disable comments for old posts');
	});

	it('Has a "Content" section', () => {
		cy.get('.settings-section').eq(3).within(() => {
			cy.contains('h3', 'Content');
		});
	});

	it('Content: Content Revisions', () => {
		fn.validateSelect('Keep x latest revisions', [40, 5, 10]);
	});

	it('Content: Empty Trash', () => {
		fn.validateSelect('Empty the trash every x weeks', [14, 21]);
	});

	it('Has a "Performance" section', () => {
		cy.get('.settings-section').last().within(() => {
			cy.findByRole('heading', {name: 'Performance', level: 3}).scrollIntoView().should('be.visible');
			cy.findByRole('heading', {name: 'Caching', level: 4}).scrollIntoView().should('be.visible');
		});
	});

	it('Performance: Caching Toggle', () => {
		cy.intercept('POST', /bluehost(\/|%2F)v1(\/|%2F)settings/).as('update');
		cy.findByLabelText('Toggle Caching').as('toggle');
		cy.get('@toggle').check();
		cy.wait('@update', {timeout: 10000});
		cy.get('@toggle').should('have.attr', 'aria-checked', 'true');
	});

	it('Performance: Caching Level', () => {
		cy.intercept('POST', /bluehost(\/|%2F)v1(\/|%2F)settings/).as('update');

		cy.get('.settings-section').last().within(() => {

			cy.findByRole('heading', {name: 'Caching Level', level: 5}).scrollIntoView().should('be.visible');

			cy.findByLabelText('Assets Only').as('assetsOnly');
			cy.findByLabelText('Assets & Web Pages').as('assetsWeb');
			cy.findByLabelText('Assets & Web Pages - Extended').as('assetsExt');

			const selectors = ['@assetsOnly', '@assetsWeb', '@assetsExt'];
			selectors.forEach((selector) => {
				const otherSelectors = Cypress._.without(selectors, selector);
				cy.get(selector).scrollIntoView().should('be.visible');
				cy.get(selector).check();
				cy.wait('@update', {timeout: 10000});
				cy.get(selector).should('be.checked');
				otherSelectors.forEach((otherSelector) => {
					cy.get(otherSelector).should('not.be.checked');
				});
			});
		});
	});

	it('Performance: Clear Everything', () => {
		cy.get('.settings-section').last().within(() => {
			cy.get('button').first().within(() => {
				cy.contains('Clear Everything');
			});
		});
	});

});
