# Arkkitehtuuri

Varausjärjestelmän käyttämät teknologiat:
* React (frontend)
* Express.js (backend)
* Apollo Server & Apollo Client (GraphQL)
* Docker
* MongoDB

## Frontend

Frontend rakentuu karkeasti seuraavasta rakenteesta

* ```frontend/src```
    * ```components```
        * ```Embeds```
            * Sisältää riippuvuuksia vain ja ainoastaan ulkoisiin npm-paketteihin.
            * Täysin eristetty riippuvuuksista muista ```Embeds``` hakemiston ulkopuolisista tiedostoista.
        * ```Modals```
            * Sovellus sisältää useita lomakkeita. Kaikki lomakkeet on määritelty tänne. Lomakkeet eivät saa olla riippuvaisia ```Pages``` kanssa.
            * Lomakkeiden tulee välttää riippuvuuksia muiden kuin ```cache.js```ja ```helpers```kanssa.
        * ```Pages```
            * Tänne määritellään kaikki sovelluksen toiminnallisuuksia hyödyntävät sivut.
        * muut
    * ```gateway```
        * Sisätää kaikki backend endpointit ja osallistuu datan esiparsintaan.
    * ```hooks```
        * ```cache.js```
            * Määrittelee ```services.js``` tiedoston määrittelemät servicet globaalisti saavutettaviksi. Antaa käyttöön rajapinnan, joka hallinnoi välimuistia ja yhteyttä backendiin.
        * ```reducers.js```
            * Määrittelee reducerit, joita käytetään backendistä haetun tiedon tallentamiseen sovelluksen välimuistiin. Välimuistin käyttö pienentää kaistaleveyttä ja parantaa suorituskykyä.
        * ```services.js```
            * Hyödyntää ```reducers.js``` tiedoston määrittelemiä välimuistin hallinta kutsuja.
            * Kommunikoi ```gateway``` kautta yhteyttä backendiin.
        * muut
    * ```helpers```
        * Apufunktiot määritellään tänne. Apufunktioilla ei tulisi olla riippuvuuksia ```components```, ```hooks``` tai ```gateway``` kanssa
    * ```App.js``` & ```index.js```
    * muut

## Backend

* ```backend```
    * ```db```
        * ```common.js```
            * Määrittelee yleisen rajapinnan MongoDB käytölle mongoosen kautta.
        * ```encoders.js```
            * Hallinnoi datan encodaamista ja decodaamista sovelluksen ja tietokannan käyttämien objectien välillä.
        * ```expand.js```
            * Määrittelee kentät Mongo modelien populate kutsua varten.
        * ```index.js```
            * Määrittelee yksillölliset rajapinnat ```common.js``` apuna käyttäen mongoosen tarjoamille mongo instansseille.
            * Määrittelee custom toteutuksen transactioneille.
    * ```graphql```
        * ```resolvers.js```
            * Määrittelee jokaisen endpointin, joiden kautta on mahdollista manipuloida tietokantaa ja sovelluksen tilaa.
    * ```models```
        * Määrittelee tietokannan scheeman.
        * Ohjelmisto on nykyään tuotantokäytössä, joten scheeman muokkaaminen voi olla riskialtista. Ole varovainen kun teet muutoksia ja jos teet, tee ne harkiten. Scheman muokkaaminen jälkikäteen ei ole yksinkertaista.
        * ```db/encoders.js``` on tarkoitettu muokkaamaan esimerkiksi kenttien nimiä, jotta tietokanta scheema pysyisi muuttumattomana sovelluslogiikan muuttuessa.
    * ```services```
        * Määrittelee palvelut esimerkiksi tietokannan alustamisesta ja sähköpostin lähetustoiminnallisuudesta.
    * ```tests```
        * Testaaminen on eristetty omaan hakemistoonsa.
        * Tällä hetkellä valtaosa testeistä ovat integraatiotestejä.
        * Tietokannan testaaminen ja ```graphql/resovers.js``` on eriytetty stubien avulla, sillä tietokanta testaaminen on hidasta.
    * ```utils```
        * Apufunktiot määritellään tänne.
    * ```app.js``` & ```index.js```
    * muut

