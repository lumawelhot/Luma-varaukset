# Käyttöohjeet

---

## Kaikille avoimet toiminnallisuudet

### Etusivu
Sovellukseen rekisteröidyt vierailut ovat kaikkien nähtävillä ja näkyvät sovelluksen etusivulla sijaitsevassa kalenterissa. Varattavissa olevat vierailut näkyvät niihin liittyvän tiedeluokan väreissä, jo varatut vierailut näkyvät harmaana. Monitieteiset vierailut näkyvät tällä hetkellä mustalla.

<img src="./img/front-page.png" width="1000" />

### Vierailujen suodatus
Kalenterissa näkyvät vierailut voi suodattaa sivustolla olevan suodatuslomakkeen avulla. Suodatinvaihtoehtoina ovat tiedeluokka, vierailutyyppi (etä- tai lähiopetus) sekä luokka-aste. Oletusarvoisesti kaikki vierailut näytetään. ```Suodata```-nappia klikkaamalla saat näkyviin käytettävissä olevat suodattimet. Valitsemalla ```Poista kaikki``` kaikki suodattimet valitaan pois käytöstä. Sen jälkeen voit klikkailla niitä päälle yksi kerrallaan. Klikkaa lopuksi ```OK```.

<img src="./img/filtering.png" width="1000" />

### Vierailun katselu
Vierailun voi valita kalenterinäkymästä, jolloin selain ohjautuu vierailun sivulle. Vierailun sivulta näkee vierailun tiedot, ja sieltä voit tehdä varauksen, jos vierailu on varattavissa.

<p align="center">
  <img src="./img/event-page.png" width="400" />
</p>

### Varauksen luonti
Kun olet napsauttanut vierailusivulta löytyvää ```Varaa vierailu``` -näppäintä,
sinut ohjataan vierailun varaussivulle. Syötä tarvittavat tiedot lomakkeeseen ja napsauta ```Tallenna```-näppäintä. Varausvahvistus lähetetään antamaasi sähköpostiosoitteeseen.

<p align="center">
  <img src="./img/book-visit.png" width="600" />
</p>

---

## Kirjautumista vaativat toiminnallisuudet

### Kirjautuminen

Sovellukseen voit kirjautua osoitteen ```/admin``` kautta. Vain tiedeluokkien työntekijät voivat kirjautua sovellukseen.

<p align="center">
  <img src="./img/login.png" height="300" />
</p>

### Vierailun luonti lomakkeella
Kirjautuneena käyttäjänä voit luoda yksittäisen vierailun järjestelmään. Vierailun luonti tapahtuu napsautamalla ```Luo uusi vierailu```-näppäintä, mikä siirtää selaimen vierailun luontilomakkeelle.

Lomakkeeseen lisättävät tiedot ovat:
 * vierailun nimi
 * kesto minuutteina
 * tagit (valinnainen: voit valita valmiista listasta tai lisätä omasi)
 * vierailutyyppi (etä/lähi)
 * etäyhteysalusta (jos etävierailu on valittu vaihtoehdoksi),
 * luokka-asteet
 * tiedeluokka
 * päivämäärä
 * aloitus- ja lopetuskellonajat
 * vierailun kuvaus

Sen jälkeen kun olet syöttänyt lomakkeeseen tarvittavat tiedot, napsauta ```Tallenna```-näppäintä.

<p align="center">
  <img src="./img/create-event.png" width="600" />
</p>

### Vierailun luonti suoraan kalenterinäkymästä
Lomakkeen sijaan voit myös luoda vierailun menemällä viikko- tai päivänäkymään ja raahaamalla kalenterista sopivan aikavälin. Vierailun luontilomake avautuu, ja päivämäärä sekä kellonajat on esitäytetty raahauksen mukaan. Voit vielä muokata niitä.

### Varausten listaus
Kirjautuneena käyttäjänä voit listata varaukset napsauttamalla sivun pohjalta löytyvää ```Varaukset```-näppäintä. Listausnäkymässä näet varaukseen liittyvän vierailun nimen, tiedeluokan ja päivämäärän. Lisäksi näet varauksen statuksen, eli onko se voimassa vai peruttu. Voit myös kopioida varauksen infosivun URL-osoitteen leikepöydälle. Saat infosivun näkyviin myös klikkaamalla varaukseen liittyvän vierailun nimeä.

<p align="center">
  <img src="./img/list-visit.png" width="600" />
</p>

## Ylläpitäjän oikeuksia vaativat toiminnallisuudet

### Käyttäjien listaus
Ylläpitäjänä voit tarkastella sovellukseen rekisteröityjä käyttäjiä osoitteessa ```/users```.

<p align="center">
  <img src="./img/users-list.png" width="300" />
</p>

### Uuden käyttäjän luonti
Ylläpitäjänä voit luoda uuden käyttäjän varausjärjestelmään osoitteessa ```/users/create```. Syötä uuden käyttäjän käyttäjänimi ja salasana lomakkeen kenttiin. Valitse käyttäjärooli (ylläpitäjä tai työntekijä) ja klikkaa lopuksi ```Tallenna käyttäjä``` .

<p align="center">
  <img src="./img/users-create.png" height="300" />
</p>