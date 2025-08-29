<img width="1512" height="748" alt="Ekran Resmi 2025-08-30 00 42 47" src="https://github.com/user-attachments/assets/aeb73582-79c5-4748-821d-da95b2923f52" />
<img width="1512" height="770" alt="Ekran Resmi 2025-08-30 00 43 01" src="https://github.com/user-attachments/assets/b9eea493-1655-40a2-b12f-d73d5ac20be1" />
<img width="1512" height="488" alt="Ekran Resmi 2025-08-30 00 43 14" src="https://github.com/user-attachments/assets/0a0e23b9-feb0-430e-ad9f-0f2e644ea2eb" />

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
