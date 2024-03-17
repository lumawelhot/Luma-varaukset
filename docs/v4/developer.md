# Ohjelmistokehittäjän ohjeet

Varausjärjestelmä on kokenut suuria muutoksia sen jälkeen, kun se ensimmäisen kerran otettiin tuotantokäyttöön. Ohjeet repositorion wikissä ovat paikoitellen vanhentuneet ja eivät siten välttämättä auta pääsemään tehokkaasti kehitystyön alkuun. Koin erityisesti tärkeäksi uudistaa ohjelmistokehittäjän ohjeet, jotta tulevaisuudessa jatkokehitys olisi mahdollisimman vaivatonta. Alla olevat ohjeet ovat tiivis pakkaus, mutta niiden pitäisi olla riittävät kehitysympäristön pystyttämiseen.

## Riippuvuudet

Päästäkseen kehitystyössä alkuun tulisi koneelle asentaa [Node.js](https://nodejs.org/en/). Sovellus on kehitetty Noden versiolla 16, joten suosittelen erityisesti sen käyttöä. Suosittelen myös asentamaan koneelle [Dockerin](https://www.docker.com/), sillä se helpottaa huomattavasti kehitystyötä. Kehitystyöstä Dockerilla myöhemmin.

Aivan ensimmäisenä tämä repositorio tulisi kloonata. Kloonaamisen jälkeen ```frontend``` ja ```backend``` hakemistoissa tulisi suorittaa komento ```npm install```, joka asentaa tarvittavat riippuvuudet. Tähän asti kaiken pitäisi olla yllättävän suoraviivaista, erityiseti mikäli Node on jo entuudestaan tuttu.

## Kehitysympäristö

Sovelluksen frontendin käynnistäminen on suoraviivaista komennolla ```npm start``` frontin hakemistossa.

Backendin kehitysympäristön käynnistäminen vaatii hiukan konfigurointia. Aluksi backendin hakemistoon tulee lisätä ```.env``` tiedosto, jossa on seuraavat tiedot (ei lainausmerkkejä):

    SECRET=kirjoita tähän satunnainen pitkä merkkijono tai numero 
    PORT=3001
    EMAILHOST=SMTP-palvelimen osoite, esim. Ethereal-palvelimen osoite
    EMAILUSER=SMTP-palvelimelle luotu käyttäjätunnus
    EMAILPASSWORD=käyttäjätunnuksen salasana
    EMAILPORT=587

Backend voidaan käynnistää useilla eri komennoilla, kuten ```package.json``` antaa ymmärtää. Kolmesta backendin käynnistävästä komennosta lyhyesti:

    1) npm start (käynnistää sovelluksen tuotantomoodissa)
    2) npm run dev (käynnistää sovelluksen dev moodissa in-memory tietokannalla)
    3) npm run docker (käynnistää sovelluksen dev moodissa Docker tietokannalla)
    4) npm run cypress (käynnistää sovelluksen test moodissa)

Mikäli kehitysympäristöä halutaan päästä mahdollisimman nopeasti testaamaan on se kätevintä listauksen toisella komennolla ```npm run dev```. Tämä komento ei vaadi MongoDB tietokantaa, joka pyörii Docker konteissa.

## Testaaminen

Tällä hetkellä valtaosa varausjärjestelmän testeistä on integraatiotestejä. Yksikkötestien lisääminen on yksi sovelluksen jatkokehitysidea. Sovelluksessa on tarkoituksella jätetty testaamatta frontendin logiikka. Frontend sisältää paikoin huomattavan määrän "side effectejä", jotka tekisivät frontin testaamisesta epäkannattavaa. Frontendin vaikeaan testattavuuteen liittyy suunnittelupäätös antaa valtaosan sovelluksen komponenteista käyttää globaalia välimuistia. Globaali välimuisti on tehnyt monta asiaa helpoksi, sillä backendin palauttamat vierailut voidaan tallentaa välimuistiin ja eri sivut voivat hyödyntää niiden dataa. Frontendin päätoiminnallisuudet testataan kuitenkin Cypressin avulla e2e testeillä. Cypress on kehitystyön aikana aiheuttanut jokseenkin päänvaivaa satunnaisesti läpi menemättömillä testeillä.

### Backendin testit

Backendin testit voidaan suorittaa komennolla ```npm run test```. Testejä on karkeesti kahden tyyppisiä. Testejä, jotka eivät käytä in-memory tietokantaa ja testejä jotka käyttävät. Älä käytä in-memory tietokantaa muutoin kuin tietokanta rajapintojen toimintaa testatessa suorituskykyyn liittyvistä syistä johtuen.

### E2E testit

Jotta e2e testejä voidaan suorittaa tulee backendin ja frontendin olla käynnissä samaan aikaan. Frontend voidaan käynnistää normaaliin tapaan komennolla ```npm start```. Backendin käynnistämiseen tulee käyttää komentoa ```npm run cypress```. Testit voidaan suorittaa ajamalla frontendin hakemistossa toinen komennoista:

    npm run cypress:open (suorita e2e testit graafisella käyttöliittymällä)
    npm run cypress:run (suorita e2e komentoriviltä)

E2e-testeihin voidaan tehdä muokkauksia hakemistossa ```frontend/cypress```.

## Kehitystyöstä Dockerilla

Ärsyttääkö, että jokainen muutos backendin koodiin resetoi tietokannan? Tietokannan pyörittäminen Docker kontissa on vastaus ongelmaan. Docker kehitysympäristön voi luoda suorittamalla repositorion juuressa oleva scripti ```run-mongo-docker.sh```. Mikäli komennon suorittaminen päättyy tekstiin "MongoDB initialized" on tietokanta onnistuneesti alustettu Docker konttiin.

Kun MongoDB pyörii Docker kontissa voidaan sovelluksen backend käynnistää komennolla ```npm run docker```. Nyt backendin uudelleen käynnistäminen ei resetoi tietokantaa.

## Muuta

Vanhentuneita varausjärjestelmän v2 käyttöohjeita voidaan tarkastella repositorion wikistä. Osa käyttöohjeista saattaa olla vielä käyttökelpoisia.

### Tiedot testikäyttäjille

Testikäyttäjät löytyvät backend\services\staticdata\users.json 

Admintili - Admin:salainen
Käyttäjätili - Employee:emp
Käyttäjätili - Employee2:emp