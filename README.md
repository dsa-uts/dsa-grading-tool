# Github pagesにデプロイする方法

参考: https://github.com/gitname/react-gh-pages

# ローカルでの環境構築方法

1. Pythonの仮想環境を作成

```bash
python -m venv .venv
. .venv/bin/activate
```

2. 仮想環境上でnodeenvをインストール

```bash
pip install nodeenv
```

3. nodeenvを使ってnode.jsの仮想環境を作成

```bash
nodeenv .vnodeenv
. .vnodeenv/bin/activate
```

# デプロイ方法
まず、パッケージをインストールする
```bash
npm install
```
その後、ローカル上でデプロイするかgh-pagesを使ってGithub pagesにデプロイするかを選択する  

* ローカル上にデプロイする場合、
```bash
npm run start
```

* Github pagesにデプロイする場合、
```bash
npm run deploy -- -m "デプロイメッセージ"
```

