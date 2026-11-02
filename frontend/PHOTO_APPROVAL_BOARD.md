# Bảng Duyệt Ảnh Thật BioNexus (Photo Approval Board)

Toàn bộ 45 tác phẩm ảnh gốc trong `src/content/photos.ts` (`PHOTOS` & `TRIP_PHOTOS`) đều là ảnh chụp thực tế từ **Wikimedia Commons**, đã được tự mở xem trực tiếp từng ảnh và xác thực tự động qua `npm run check:photos` (`scripts/verify-photos.mjs` — `45/45 PASS`, `0 missing`, `0 sai giấy phép`, `357/357` tệp vật lý trong `public/photos` và `public/trip` khớp mục credit).

## Kết quả chạy `npm run check:photos`

```text
=== BioNexus Photo & Commons License Verification (check:photos) ===
Tìm thấy 45 sourceUrl duy nhất trong src/content/.
[OK] File:Ambystoma mexicanum.005 - Aquarium Finisterrae.jpg — Fernando Losada Rodríguez · CC BY-SA 4.0 (5152x3864)
[OK] File:Axolotl ambystoma mexicanum anfibio ASAG.jpg — Amandasofiarana · CC BY-SA 4.0 (1920x1280)
[OK] File:Trajineras (Xochimilco, 2009).JPG — El Comandante · CC BY-SA 3.0 (3648x2736)
[OK] File:Large lower pitcher of wild Nepenthes rajah plant.jpg — Unknown · Public domain (1488x1984)
[OK] File:Nepenthes rajah (5).jpg — NepGrower at English Wikipedia · Public domain (1984x1488)
[OK] File:Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 5.jpg — kallerna · CC BY-SA 4.0 (5100x3400)
[OK] File:Python regius - ball python.jpg — Brian Gratwicke · CC BY 2.0 (4855x3036)
[OK] File:Python regius 070731 a.jpg — Rainer Altenkamp · CC BY-SA 3.0 (1848x1626)
[OK] File:Savanna landscape, Northern region, Ghana.jpg — Stig Nygaard · CC BY 2.0 (2560x1827)
[OK] File:Eublepharis macularius 2009 G6.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:EUBLEPHARIS-MACULARIUS Leopard-Gecko Leopardgecko 201705276011.jpg — Christian von Faber-Castell · CC BY 4.0 (8688x5792)
[OK] File:Sunset in mountains, Turbat, Balochistan.jpg — Yasir Dora · CC BY-SA 4.0 (5344x3056)
[OK] File:Venus Flytrap - Dionaea muscipula, Green Swamp, Supply, North Carolina, October 18, 2021 (51693075042).jpg — Judy Gallagher · CC BY 2.0 (6720x4480)
[OK] File:Venus flytrap (53886303376).jpg — Judy Gallagher · CC BY 2.0 (3117x3117)
[OK] File:Longleaf Pine Savanna II (13158080455).jpg — Justin Meissen from St Paul, United States · CC BY-SA 2.0 (2400x1600)
[OK] File:Burmese Python photographed at Bardiya National Park2.jpg — Shadow Ayush · CC BY-SA 4.0 (6000x4000)
[OK] File:Burmese Python 03.jpg — SuperJew · CC BY-SA 3.0 (1600x1200)
[OK] File:Cat Tien Park, Vietnam, tropical forest, roots.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)
[OK] File:Pogona vitticeps close-up 2009 G1.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Pogona vitticeps 2009 G1.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3615.jpg — Dietmar Rabich · CC BY-SA 4.0 (6720x4480)
[OK] File:Testudo hermanni Boettgeri - 01.jpg — NorbertNagel · CC BY-SA 4.0 (3564x2376)
[OK] File:Testudo hermanni hermanni 01.jpg — Olaf Tausch · CC BY 3.0 (3126x2344)
[OK] File:Formation maquis.jpg — AmélieBertaigne · CC BY-SA 4.0 (3182x2387)
[OK] File:Pitcher Plant (Nepenthes ampullaria) (14136485484).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3222x2133)
[OK] File:Pitcher Plants (Nepenthes ampullaria) (8410326499).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3648x2736)
[OK] File:A view of the old rainforest- not much left unfortunately (11463945203).jpg — shankar s. from Dubai, united arab emirates · CC BY 2.0 (4288x2848)
[OK] File:Eublepharis macularius 1.jpg — Michał Zawiślak (mihauz @) · CC BY-SA 2.5 (2048x1536)
[OK] File:G. noční.jpg — Det at Czech Wikipedia · Public domain (2288x1712)
[OK] File:Pogona vitticeps 2009 G2.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Python regius - hypomelanistic.png — WingedWolfPsion · CC BY-SA 3.0 (1780x1070)
[OK] File:Burmese Python 02.jpg — Danleo~commonswiki · CC BY 2.5 (3264x2448)
[OK] File:Testudo hermanni JPG.jpg — Jean-Pol GRANDMONT · CC BY 3.0 (1936x1288)
[OK] File:Ambystoma mexicanum 2.jpg — Stan Shebs · CC BY-SA 3.0 (1800x794)
[OK] File:Dionaea muscipula trap.jpg — che · CC BY-SA 2.5 (3456x2304)
[OK] File:Nepenthes rajah.png — Unknown · Public domain (1488x1984)
[OK] File:Nep amp 295.jpg — No machine-readable author provided. NepGrower~commonswiki assumed (based on copyright claims). · CC BY-SA 2.5 (1488x1984)
[OK] File:Forest in Cuc Phuong National Park (15706323528).jpg — hds · CC BY 2.0 (4288x2848)
[OK] File:Taman Negara, Malaysia, Canopy Walkway.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)
[OK] File:Venus Flytrap showing trigger hairs.jpg — Noah Elhardt · CC BY-SA 2.5 (1527x1670)
[OK] File:Tree Ferns (Cyathea sp.) and Montane Forest (14647918801).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3241x2130)
[OK] File:Nepenthes ampullaria elongated.jpg — Mgiganteus · CC BY-SA 3.0 (1984x1488)
[OK] File:Ambystoma mexicanum 3.jpg — Stan Shebs · CC BY-SA 3.0 (1800x1235)
[OK] File:Calanque de Cassis.jpg — Cocosea · CC BY-SA 4.0 (2560x1536)
[OK] File:Fishing on Tembeling River, Taman Negara, Malaysia.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)

=== KẾT QUẢ KIỂM TRA ẢNH (PASS) ===
- Tổng số sourceUrl Wikimedia Commons đã xác thực: 45/45 (0 missing, 0 sai giấy phép)
- Tổng số file vật lý trong public/photos & public/trip: 357/357 đều khớp mục credit
```
