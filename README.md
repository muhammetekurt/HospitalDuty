
<img width="1153" height="807" alt="Ekran Resmi 2025-08-26 22 32 10" src="https://github.com/user-attachments/assets/0397bdb0-8f5a-4dd4-b91e-a21bf2d018d3" />

<img width="1015" height="956" alt="Ekran Resmi 2025-08-26 22 32 39" src="https://github.com/user-attachments/assets/24d9cfd1-487d-47f8-9a69-e3ca31500d60" />

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
