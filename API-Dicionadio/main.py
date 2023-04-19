import requests
import json


dados = requests.get("https://api.dicionario-aberto.net/");
print(dados.json());
