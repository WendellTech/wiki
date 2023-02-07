import should from 'should';
import { Polly, setupMocha as setupPolly } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';

import wiki from '../src/wiki.js';

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

const timeoutTime = 30000;

describe('Live tests', () => {
	setupPolly.beforeEach({
		adapters: ['node-http'],
		persister: 'fs',
		recordFailedRequests: true
	});
	setupPolly.afterEach();
	// 	recordFailedRequests: true
	// });

	beforeEach(function(done) {
		this.timeout(timeoutTime);
		setTimeout(() => {
			done();
		}, 100);
	});

	it.skip('should handle error response', function(done) {
		this.timeout(timeoutTime);
		wiki()
			// The status code is 200 normally,
			// but overrided to 400 in recordings/Live-tests_4163164458/should-handle-error-response_922613357/recording.har.
			.random()
			.catch(e => {
				e.message.should.equal('400: Bad Request');
				done();
			});
	});
	it('should handle non existent pages properly', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('asdasdlkalskdjalsdjalskdalsdjasdasd')
			.catch(e => {
				e.message.should.equal('No article found');
				done();
			});
	});
	it('should return first foreign image as main', function(done) {
		this.timeout(timeoutTime);
		wiki({ apiUrl: 'https://de.wikipedia.org/w/api.php' })
			.page('Batman')
			.then(page => {
				page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/commons/2/2b/MCM_2013_-_Batman_%288979342250%29.jpg'
					);
					done();
				});
			});
	});
	it('should use different names for "image" for foreign wikis', function() {
		this.timeout(timeoutTime);
		return wiki({ apiUrl: 'https://es.wikipedia.org/w/api.php' })
			.page('Cristiano Ronaldo')
			.then(page => {
				return page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg'
					);
				});
			});
	});
	it('should handle Issue #53', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('FC Copenhagen')
			.then(page => {
				page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/en/9/93/FC_K%C3%B8benhavn.svg'
					);
					done();
				});
			});
	});
	it('should handle Issue #54', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('FC Santa Coloma')
			.then(page => {
				page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/en/a/ab/Santa-Coloma1.png'
					);
					done();
				});
			});
	});
	it('should handle Issue #55', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'https://oldschoolrunescape.wikia.com/api.php',
			origin: null
		})
			.search('Quests')
			.should.eventually.have.property('results')
			.containEql('Minigames');
	});
	it('should handle Issue #57', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'https://oldschoolrunescape.wikia.com/api.php',
			origin: null
		})
			.search('Bob')
			.catch(e => e.message.should.equal('text search is disabled'));
	});
	it('should handle Issue #59', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('Batman')
			.then(page => {
				page.langlinks().then(links => {
					links.should.containEql({
						lang: 'ru',
						title: 'Бэтмен',
						url:
							'https://ru.wikipedia.org/wiki/%D0%91%D1%8D%D1%82%D0%BC%D0%B5%D0%BD'
					});
					links.should.containEql({
						lang: 'az',
						title: 'Betmen',
						url: 'https://az.wikipedia.org/wiki/Betmen'
					});
					done();
				});
			});
	});
	it('should handle Issue #62', function(done) {
		this.timeout(timeoutTime);
		const wi = wiki({
			apiUrl: 'http://fr.wikipedia.org/w/api.php'
		});
		wi.search('royan').then(data => {
			wi.page(data.results[0]).then(page => {
				page.mainImage().then(img => {
					img.should.equal(
						'https://upload.wikimedia.org/wikipedia/commons/1/18/Port_Royan.jpg'
					);
					done();
				});
			});
		});
	});
	it('should handle Issue #63', function() {
		this.timeout(timeoutTime);
		return wiki()
			.findById(250197)
			.then(page => {
				return page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/en/1/12/France_national_football_team_seal.svg'
					);
				});
			});
	});
	it('should handle Issue #64', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.findById(3165)
			.then(page => {
				page.mainImage().then(mainImage => {
					mainImage.should.equal(
						'https://upload.wikimedia.org/wikipedia/commons/7/79/ACF_Fiorentina.svg'
					);
					done();
				});
			});
	});
	it('should handle Issue #72', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('Java_Classloader')
			.then(page => {
				page.mainImage().then(mainImage => {
					should.equal(mainImage, undefined);
					done();
				});
			});
	});
	it('should handle Issue #74 -> make all infoboxes available', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.page('Cross_Game')
			.then(page => page.fullInfo())
			.then(info => {
				info.tvSeries.director.should.equal('Osamu Sekita');
				done();
			});
	});
	it('should handle Issue #80 -> implement find method (default behavior)', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.find('kylie jenner')
			.then(page => page.fullInfo())
			.then(info => {
				info.general.birthName.should.equal('Kylie Kristen Jenner');
				done();
			});
	});
	it('should handle Issue #80 -> implement find method with predicate', function(done) {
		this.timeout(timeoutTime);
		wiki()
			.find('kylie jenner', results =>
				results.find(result => result.includes('Kim'))
			)
			.then(page => page.fullInfo())
			.then(info => {
				info.general.birthName.should.equal('Kimberly Noel Kardashian');
				done();
			});
	});
	it('should fetch all pages of wiki', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'http://batman.wikia.com/api.php'
		})
			.allPages()
			.then(pages => pages.length.should.be.above(7000));
	});
	it('should fetch all categories of wiki', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'http://batman.wikia.com/api.php'
		})
			.allCategories()
			.then(cats => cats.should.containEql('Characters'));
	});
	it('should fetch all pages in category', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'http://batman.wikia.com/api.php'
		})
			.pagesInCategory('Category:Characters')
			.then(pages => pages.should.containEql('Batman'));
	});
	it('should handle issue #83', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('athena')
			.then(p => {
				return p.mainImage().then(name => {
					return name.should.equal(
						'https://upload.wikimedia.org/wikipedia/commons/2/22/Mattei_Athena_Louvre_Ma530_n2.jpg'
					);
				});
			});
	});
	it('should handle opensearch', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'https://lol.gamepedia.com/api.php'
		})
			.opensearch('Ashe')
			.then(titles => titles.should.containEql('Ashe/Old Lore'));
	});
	it('should use opensearch as backup when text search is disabled', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'https://lol.gamepedia.com/api.php'
		})
			.search('Ashe')
			.then(titles =>
				titles.should.have.property('results').containEql('Ashe/Old Lore')
			);
	});
	it('should handle fuzzy prefix searches', function() {
		this.timeout(timeoutTime);
		return wiki()
			.prefixSearch('mic')
			.then(titles =>
				titles.should.have.property('results').containEql('Michael Jordan')
			);
	});
	it('should fetch deep infoboxes [Issue #95]', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Copper')
			.then(page =>
				page.info().should.eventually.have.property('symbol', 'Cu')
			);
	});
	// it('should parse tables [Issue #94]', function() {
	//   this.timeout(timeoutTime);
	//   return wiki({
	//     apiUrl: 'https://cod-esports.gamepedia.com/api.php'
	//   })
	//     .page('Team Envy')
	//     .then(page => page.tables())
	//     .then(tables => {
	//       console.log(tables);

	//       tables[0].heading.should.equal('Player Roster');
	//       tables[0].subheading.should.equal('Active');
	//       tables[0].rows[0]
	//         .join(',')
	//         .should.equal('Huke,sa,Cuyler Garland,SMG Slayer,joined=2017-11-04');
	//     });
	// });
	it('should parse structured content data [Issue #102]', function() {
		this.timeout(timeoutTime);
		return wiki({
			apiUrl: 'https://cod-esports.gamepedia.com/api.php'
		})
			.page('OpTic Gaming')
			.then(page => page.content())
			.then(content => {
				content[0].items[0].title.should.equal('Organization');
			});
	});

	it('should parse info from zh wiki', function() {
		this.timeout(timeoutTime);
		let term = '林淑如';
		let apiUrl = 'https://zh.wikipedia.org/w/api.php';
		wiki({ apiUrl: apiUrl })
			.page(term)
			.then(page => page.info())
			.then(info => info.deathDate.should.have.property('age', 54));
	});

	it('should use first main image if there are multiple', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Wikipedia')
			.then(page => {
				return page
					.mainImage()
					.should.eventually.equal(
						'https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg'
					);
			});
	});

	it('should parse Dublin data', () => {
		const opts = {
			parser: {
				simplifyDataValues: false
			}
		};
		return wiki(opts)
			.page('Dublin')
			.then(page => {
				return page.info().then(info => {
					info.name.should.equal('Dublin');
					info.gdp.should.equal('€106 billion');
					info.populationTotal.should.equal(554554);
				});
			});
	});

	it('should parse wiki url', () => {
		return wiki()
			.page('djinn')
			.then(page => {
				return page.url().should.equal('https://en.wikipedia.org/wiki/Jinn');
			});
	});

	it('should use sections alias', () => {
		return wiki()
			.page('batman')
			.then(page => page.sections())
			.then(content => {
				return content[0].title.should.equal('Publication history');
			});
	});

	it('should allow API query', () => {
		return wiki()
			.api({
				action: 'parse',
				page: 'Pet_door'
			})
			.then(res => res.parse.title.should.equal('Pet door'));
	});

	it('should fetch most viewed pages in wiki', () => {
		return wiki({ apiUrl: 'https://fr.wikipedia.org/w/api.php' })
			.mostViewed()
			.then(list => {
				list[4].title.should.equal('Carinne Teyssandier');
				list[4].count.should.equal(19544);
			});
	});

	it('should return references in correct order', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Elon Musk')
			.then(page => page.references())
			.then(refs => {
				refs[0].should.equal(
					'https://www.independent.co.uk/life-style/elon-musk-son-grimes-childcare-interview-a9638321.html'
				);
				refs[3].should.equal(
					'https://www.fastcompany.com/1367866/tesla-lawsuit-drama-ends-five-company-founders-emerge'
				);
			});
	});

	it('should fetch main image #128', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Microsoft')
			.then(page => page.mainImage())
			.then(img => {
				img.should.equal(
					'https://upload.wikimedia.org/wikipedia/commons/3/30/Building92microsoft.jpg'
				);
			});
	});

	it('should fetch title #150', function() {
		this.timeout(timeoutTime);
		return wiki()
			.find('Alphabet')
			.then(page => {
				page.title.should.equal('Alphabet');
			});
	});

	it('should parse external references', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Batman')
			.then(page => page.references())
			.then(refs => {
				refs.should.containEql(
					'http://www.behindthevoiceactors.com/characters/Batman/Batman/'
				);
				refs.length.should.equal(143);
			});
	});

	it('should allow calling rawContent #153', function() {
		this.timeout(timeoutTime);
		return wiki()
			.find('Alphabet')
			.then(page => {
				return page
					.rawContent()
					.then(rawContent => rawContent.length.should.equal(33276));
			});
	});

	it('should load main image #157', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('Lisa_(rapper)')
			.then(page => page.mainImage())
			.then(mainImage =>
				mainImage.should.equal(
					'https://upload.wikimedia.org/wikipedia/commons/8/85/Blackpink_Lisa_Vogue_2021.png'
				)
			);
	});

	it('should chain requests #159', function() {
		this.timeout(timeoutTime);
		return wiki()
			.page('albert einstein')
			.then(page =>
				page
					.chain()
					.summary()
					.image()
					.links()
					.categories()
					.extlinks()
					.langlinks()
					.request()
			)
			.then(data => {
				data.extract.should.containEql('physicist');
				data.image.thumbnail.source.should.containEql('restoration.jpg');
				data.links.should.containEql('1921 Nobel Peace Prize');
				data.categories.should.containEql('Category:1879 births');
				data.extlinks.should.containEql('http://einstein.biz/');
				data.langlinks[0].lang.should.equal('ab');
			});
	});

	it('should support chaining from root', function() {
		// Source: https://stackoverflow.com/questions/35826469/how-to-combine-two-wikipedia-api-calls-into-one/35830161
		this.timeout(timeoutTime);
		return wiki()
			.chain()
			.geosearch(52.52437, 13.41053)
			.summary()
			.image()
			.coordinates()
			.request()
			.then(data => {
				data[0].title.should.equal('Volksbühne');
				data[0].extract.should.containEql('theater');
				data[0].image.thumbnail.source.should.containEql('BChBerlJan08.JPG');
				data[0].coordinates.lat.should.equal(52.52694444);
			});
	});

	it('main image should work for fr.wikipedia.org #156', function() {
		this.timeout(timeoutTime);
		return wiki({ apiUrl: 'https://fr.wikipedia.org/w/api.php' })
			.page('Sigmund Freud')
			.then(page => {
				return page
					.mainImage()
					.then(url =>
						url.should.equal(
							'https://upload.wikimedia.org/wikipedia/commons/3/36/Sigmund_Freud%2C_by_Max_Halberstadt_%28cropped%29.jpg'
						)
					);
			});
	});

	it('general api query should be available for use #172', function() {
		this.timeout(timeoutTime);
		return wiki({ apiUrl: 'https://starcitizen.tools/api.php' })
			.api({
				format: 'json',
				prop: '',
				list: 'categorymembers',
				cmtitle: 'Category:Ships',
				cmprop: 'ids|title',
				cmnamespace: '0',
				cmlimit: '500'
			})
			.then(data => {
				return data.query.categorymembers[13].title.should.equal(
					'A2 Hercules Starlifter'
				);
			});
	});

	it('should be able to export page as XML', function() {
		this.timeout(timeoutTime);
		return wiki()
			.exportXml('Elizabeth_II')
			.then(data => {
				return data
					.indexOf('Queen of the United Kingdom from 1952 to 2022')
					.should.equal(3113);
			});
	});
});
