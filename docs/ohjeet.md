# Käyttöohjeet

## Etusivu
Sovelluseen rekisteröidyt tapahtumat ovat kaikkien nähtävillä ja
näkyvät sovelluksen etusivulta sijaitsevassa kalenterissa.

<img src="./img/front-page.png" height="300" />

## Kirjautuminen
Sovellukseen voi kirjautua osoitteen ```/admin``` kautta.

<img src="./img/login.png" height="300" />

## Tapahtuman luonti
Kirjautunut käyttäjä voi luoda yksittäisen vierailun järjestelmään.
Vierailun luonti tapahtuu napsautamalla ```Luo uusi vierailu```-näppäintä,
mikä siirtää selaimen vierailun luovaan lomakkeelle.

Lomakkeeseen lisättävät tiedot ovat:
 * tapahtuman nimi,
 * tagit,
 * tapahtuman luokka-aste,
 * tiedeluokka,
 * päivämäärä,
 * aloitus- ja lopetuskellonajat, sekä
 * tapahtumaa kuvaus.

Sen jälkeen kun olet syöttänyt lomakkeeseen tarvittavat tiedot, napsauta ```Tallenna```-näppäintä.

<img src="./img/luo-uusi-tapahtuma.png" height="600" />

## Tapahtuman katselu
Tapahtuman voi valita kalenterinäkymästä,
joilloin selain ohjautuu tapahtuman sivulle.
Tapahtuman sivusta näkee tapahtuman tiedot
ja sieltä voi tehda tapahtumaan vieraulun varauksen.

<img src="./img/event-page.png" height="300" />

## Varauksen luonti
Kun käyttäjä on napsauttanut tapahtuman sivusta lyötyvää ```Varaa vierailu```-näppäintä,
hänet ohjataan vieraulun varaussivulle. Kun käyttäjä on syöttänyt lomakkeeseen tiedot ja
napsauttanut ```Tallenna```-näppäintä, hän saa varauksen tunnuksen ja
varauksen perumista varten pin-koodin.

<img src="./img/book-visit.png" height="600" />

## Käyttäjien listaus
Ylläpitäjä voi nähdä sovelluseen rekisteröidyt käyttäjät siirtymällä osoitteelle ```/users```.

<img src="./img/users-list.png" height="200" />

## Uuden käyttäjän luonti
Ylläpitäjä voi luoda käyttäjän varausjärjestelmään siirtymällä osoitteelle ```/users/create```.
Uuden käyttäjän käyttäjänimi ja salasana kirjoitetaan lomakkeeden kenttiin.
Valintanapilla ```Käyttäjärooli``` voi valita onko uusi käyttäjä ylläpitäjä vai työntekijä.

<img src="./img/users-create.png" height="300" />
