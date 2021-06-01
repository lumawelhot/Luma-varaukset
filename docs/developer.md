# Ohjeet

## Paikallinen asennus
Sovellus käyttää [node.js](nodejs.org/) ympäristöä ja
sen pakkausten hallintaan työkalua npm.
Molempien tulee olla asennettuna, jotta sovellus voi toimia.
  * Kloonaa tämä github-repositio: ```git clone https://github.com/lumawelhot/Luma-varaukset```
  * Asenna projektien `frontend` ja `backend` riippuvuudet:
    1. Siirry `frontend` hakemistoon ```cd frontend/``` ja asenna tarvittavat riippuvuudet kirjoittamalla komennon ```npm install```
    2. Siirry `backend` hakemistoon ```cd backend/``` ja asenna tarvittavat riippuvuudet kirjoittamalla komennon ```npm install```

## Paikallinen käynnistys
Frontendin ja backendin pitää olla samanaikaisesti päällä.
Siirry `frontend` hakemistoon ja käynnistä sovelluksen `frontend`  kirjoittamalla komennon ```npm start```.
Siirry sitten `backend` hakemistoon.
Voit käynnistä sovelluksen kehitysversion `backend` kirjoittamalla komennon ```npm run dev``` ja
tuotantoversion `backend` kirjoittamalla komennon ```npm start``.

## Kehitystyö Dockerin kanssa
Asenna [docker](https://docs.docker.com/engine/install/) koneseen.
Kontin rakennus:
```docker build -t luma-varaukset:latest .```

Uuden kontin käyttöönotto:
```docker-compose restart && docker-compose logs -f```

Jos et havaitse muutosta:
```docker-compose down && docker-compose up -d && docker-compose logs -f```

Frontendin kopioiminen konttiin ilman että konttia rakennetaan uudelleen (hyvä jos haluat nopeasti testata muutokset tuotantomoodissa):
```cd frontend```
```PUBLIC_URL=/luma-varaukset npm run build && docker cp build luma-varaukset-app:/app/backend```

## Cypress testaus
Testit kirjoitetaan `.../frontend/cypress` kansioon.
Asenna riippuvuudet ja käynnistä paikallisessa koneessa `frontend`- ja `backend`-sovellukset.
Siirry `frontend`-kansioon ja suorita komento `npm run cypress:open`.
Cypress-testien ajo-ohjelma käynnistyy uuteen ikkunaan.
Ohjelman avulla voit ajaa Cypress-testit painamalla ```run all specs```-näppäintä.
