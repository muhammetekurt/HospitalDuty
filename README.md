
<img width="1315" height="845" alt="Ekran Resmi 2025-08-24 00 08 45" src="https://github.com/user-attachments/assets/9fa20fe0-8c2a-414a-b124-7a0db4a7b7a0" />

<img width="1315" height="835" alt="Ekran Resmi 2025-08-24 00 09 06" src="https://github.com/user-attachments/assets/3d30e293-e321-48a8-922d-e60fa1bbe06b" />

<img width="1315" height="908" alt="Ekran Resmi 2025-08-24 00 09 15" src="https://github.com/user-attachments/assets/76ffe83f-f803-429e-977f-809d9c7d8ad3" />



# Branch Rules

Bu **README** dosyası, proje üzerinde branch açma, isimlendirme ve Pull Request kurallarını tanımlar.

### Amaç:

Git sürecinde düzenli, anlaşılır ve takip edilebilir bir akış sağlamaktır.

### Genel kurallar:

```bash
Her geliştirici kendi branch’inde çalışır.

Branch isimleri küçük harf olur, boşluk yerine - kullanılır.

Merge sonrası branch silinir.
```

## Branch Türleri:

```bash
# Feature Branch:

Format:
feature/<feature-name> → Yeni özellik geliştirme

Örnek:
feature/login-page
```
```bash
# Bugfix Branch:

Format:
bugfix/<short-bug-description> → Hata düzeltme

Örnek:
bugfix/fix-user-role-bug
```
### Yeni branch oluşturup ilgili branch’e nasıl geçilir:
```bash
git checkout -b feature/login-page
```
### Branch Push Etmek:
```bash
git push origin feature/login-page
```
### Branch Silmek(Local):
```bash
git branch -d feature/login-page
```
### Branch Silmek(Remote):
```bash
git push origin --delete feature/login-page
```
