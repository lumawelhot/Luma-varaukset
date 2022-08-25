# Pohdintoja

Koska e2e testit ovat raskaita ajaa on järkevä lähestyä testejä ajatuksella: Mitä haluan, että käyttäjä voi tehdä sen sijaan, että mitä se ei voi tehdä.

Tarkastellaan kahta skenaariota:
* Asiakkaana voin varata vierailun
* Asiakkaana en voi varata vierailua jos lomakkeen yksi kentistä on virheellinen

Edellä mainituista ensimmäinen on testattavan asiana huomattavasti arvokkaampi, sillä se testaa suoraan, että jokin tietty ominaisuus toimii ja vastaa juurikin sitä userstoryä jonka asiakas on halunnut. Toisena mainitun ongelma on halutaanko käyttää e2e testi testaamaan asiaa, joka on loppujen lopuksi backendin ja frontendin validaatioiden vastuulla.

On myös tiettyjä ominaisuuksia joita ei välttämättä tarvitse edes testata:
* Työntekijänä voin kirjautua varausjärjestelmään

Ongelma edellä mainitun testaamisessa on, että mikäli käyttäjä oikeasti ei voi kirjautua varausjärjestelmään se olisi hyvin todennäköisesti huomattu jo kehitysvaiheessa ja kyseisen tapahtuman testaaminen on melko tarpeetonta.

Siinä hiukan pohdittavaa: 
* Mikä on sellaista joka on järkevää testata?
* Minkä asian testaamisesta on asiakkaalle suurin arvo?
* Kannattaako ylipäätänsä tehdä e2e testejä?