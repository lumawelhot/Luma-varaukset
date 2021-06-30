# Ohjeet

## Paikallinen asennus

 Jotta sovellusta voidaan ajaa, koneelle on asennettava [Node.js](https://nodejs.org/), jonka mukana asentuu myös npm-pakkaustenhallintatyökalu. 

1. Kloonaa tämä github-repositio:

       git clone https://github.com/lumawelhot/Luma-varaukset
            
2. Asenna projektin `frontendin` ja `backendin` riippuvuudet:
    - Siirry `frontend`-hakemistoon `cd frontend/` ja asenna tarvittavat riippuvuudet kirjoittamalla komento 

          npm install

    - Siirry `backend`-hakemistoon `cd backend/` ja asenna tarvittavat riippuvuudet kirjoittamalla komento

          npm install

    - Luo `backend`-hakemiston juureen .env-tiedosto ja lisää sinne seuraavat rivit (älä käytä missään kohdassa lainausmerkkejä):

          SECRET=kirjoita tähän satunnainen pitkä merkkijono tai numero 
          PORT=3001
          EMAILHOST=SMTP-palvelimen osoite, esim. Ethereal-palvelimen osoite
          EMAILUSER=SMPTP-palvelimelle luotu käyttäjätunnus
          EMAILPASSWORD=käyttäjätunnuksen salasana
          EMAILPORT=587

---

## Paikallinen käynnistys

`Frontendin` ja `backendin` pitää olla samanaikaisesti päällä.
1. Siirry `frontend`-hakemistoon ja aja komento 

       npm install

2. Käynnistä sovelluksen `frontend` kirjoittamalla komento 
  
       npm start

3. Siirry sitten `backend`-hakemistoon ja aja komento 
        
       npm install

4. Käynnistä sovelluksen kehitysversion `backend` kirjoittamalla komento

       npm run dev

---

## Testien ajaminen

Jest-testien ajaminen sekä `frontendissa` että `backendissa`
1. Aja Jest-testit komennolla 

       npm run test 

End to end -testien ajaminen `frontendissa`

2. Aja testit komennolla

       npm run test:e2e
    Huomaa, että kun ajat e2e-testejä (Cypress-testejä), sekä `frontendin` että `backendin` on oltava käynnissä.

3. Voit ajaa e2e-testit myös komennolla 

       npm run cypress:open
        
    Cypress-testien ajo-ohjelma käynnistyy uuteen ikkunaan. Ohjelman avulla voit ajaa kaikki Cypress-testit painamalla `run all specs` -näppäintä tai vaihtoehtoisesti vain tietyt testit klikkaamalla vastaavaa feature-tiedostoa.

---

## Kehitystyö Dockerin kanssa

Asenna [docker](https://docs.docker.com/engine/install/) koneeseen.

1. Hae sovelluksen uusimman version kontti DockerHubista ajamalla komento sovelluksen juurikansiossa

       docker build -t lumawelhot/luma-varaukset:latest .

2. Alusta sovelluksen .env-tiedosto Docker-konttiin
    - Tarvitset alustamiseen SMTP-palvelimen osoitteen, portin, SMTP-palvelimelle luodun käyttäjätunnuksen ja tunnuksen salasanan
    - Tarkista, että Docker-kontti on käynnissä (ks. kohdat 1 - 3)
    - Aja Unix-ympäristössä komento `sh initialize.sh` sovelluksen juurikansiossa ja anna skriptille edellä mainitut tiedot
    - Windows-ympäristössä käytä Git Bashia ja aja komento `sh init_gitbash.sh` ja anna skriptille edellä mainitut tiedot

3. Mikäli kontin asentaminen onnistuu, sovelluksen pitäisi olla nyt käytettävissä osoitteessa 

       http://localhost/luma-varaukset/


### Muita hyödyllisiä Docker-komentoja

1. Käynnistä olemassa oleva kontti uudelleen komennolla

       docker-compose restart && docker-compose logs -f

2. Mikäli edellinen komento ei päivitä sovellusta, sinun täytyy rakentaa kontti uudelleen komennolla

       docker-compose down && docker-compose up -d && docker-compose logs -f

3. Voit kopioida `frontendin` konttiin ilman, että konttia rakennetaan uudelleen, komennoilla `cd frontend` ja
  
        PUBLIC_URL=/luma-varaukset npm run build && docker cp build luma-varaukset-app:/app/backend
    - Hyvä, jos haluat nopeasti testata muutokset tuotantomoodissa!
    - Ei toimi välttämättä Windows-käyttäjillä
