[![Node.js CI on push](https://github.com/lumawelhot/Luma-varaukset/actions/workflows/node-ci-push.yml/badge.svg?branch=main)](https://github.com/lumawelhot/Luma-varaukset/actions/workflows/node-ci-push.yml)
[![luma-varaukset](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/qwar56/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/qwar56/runs)
[![codecov](https://codecov.io/gh/lumawelhot/Luma-varaukset/branch/main/graph/badge.svg?token=MKjBJz1234)](https://codecov.io/gh/lumawelhot/Luma-varaukset)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# LUMA-varaukset

LUMA-varaukset on Helsingin yliopiston LUMA-tiedeluokkien tiedevierailujen varaamiseen tarkoitettu web-sovellus. Varausjärjestelmässä opettaja voi selata tarjolla olevia tiedevierailuja kalenterinäkymässä, suodattaa niitä esimerkiksi luokka-asteen mukaan sekä tehdä varauksia. Tiedeluokkien työntekijät voivat luoda uusia vierailuja ja tarkastella tehtyjä varauksia.

Sovellus on toteutettu Helsingin yliopiston aineopintojen kurssille Ohjelmistotuotantoprojekti (kesä 2021). Ensimmäinen release on julkaistu 30.6.2021, ja sovelluskehitys jatkuu kurssin päätyttyä muissa projekteissa.

Sovellus on tällä hetkellä käytettävissä [staging-palvelimella](https://ohtup-staging.cs.helsinki.fi/luma-varaukset/).

---

_LUMA-varaukset is an online reservation system for arranging visits to the LUMA Science Labs of the University of Helsinki. The application offers a calendar view for browsing available timeslots as well as functionality for booking and cancelling a reservation._

_The application has been created for the Helsinki University course Software Engineering Lab (summer 2021). The first release was published 30 June 2021, and development continues in other projects. You can view the current version of the software [here](https://ohtup-staging.cs.helsinki.fi/luma-varaukset/)._

_Documentation is available only in Finnish._


## Dokumentaatio

[Käyttöohjeet](./docs/ohjeet.md)

[Sovelluskehityksen ohjeet](./docs/developer.md)

[Ohjelmiston arkkitehtuuri](./docs/img/architecture.png)

[Definition of Done](./docs/definition_of_done.md)


## Releaset

[LUMA-varaukset 1.0](https://github.com/lumawelhot/Luma-varaukset/releases/tag/v1.0)


## Kiitokset

Sovellus hyödyntää kalenterinäkymässä [react-big-calendar](https://github.com/jquense/react-big-calendar) -komponenttia. Automaattiseen sähköpostin lähetykseen käytetään [Nodemaileria](https://nodemailer.com/about/). Lisäksi sovellus käyttää [Apollo](https://www.apollographql.com/docs/apollo-server/)-serveriä ja [Bulma](https://bulma.io/)-tyylikirjastoa.


## Projektin dokumentaatio

[Projektin kehitysjono](https://docs.google.com/spreadsheets/d/1jKcC4YyXZ3QNNSCfvvapEfwdzT-gH4OzLNnMJK1LMGA/edit?usp=sharing) (Product Backlog)

[Sprinttien tehtävälistat ja tuntikirjanpito](https://docs.google.com/spreadsheets/d/1QTQyVfhW5SEzO3SSph0t2J4dzxE0-PgdmP1BX4H8VZk/edit?usp=sharing) (Sprint Backlog)


## Lisenssi

Sovellus on lisensoitu vapaalla [MIT](LICENSE.md)-ohjelmistolisenssillä.
