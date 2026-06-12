# Lancer les tests manuellement

## Prérequis

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9) installé
- Être à la racine du projet (`EscrimeProj/`)

---

## Commandes de base

### Lancer tous les tests
```bash
dotnet test EscrimeGame.sln
```

### Lancer uniquement le projet de tests
```bash
dotnet test EscrimeGame.Tests/EscrimeGame.Tests.csproj
```

### Sans recompiler (plus rapide si le code n'a pas changé)
```bash
dotnet test EscrimeGame.Tests/EscrimeGame.Tests.csproj --no-build
```

---

## Filtrer les tests

### Par classe de test
```bash
dotnet test --filter "FullyQualifiedName~ChampionTests"
dotnet test --filter "FullyQualifiedName~RankingTests"
dotnet test --filter "FullyQualifiedName~BaseScoringTests"
dotnet test --filter "FullyQualifiedName~PenaltyTests"
dotnet test --filter "FullyQualifiedName~StreakBonusTests"
dotnet test --filter "FullyQualifiedName~DisqualificationTests"
dotnet test --filter "FullyQualifiedName~GuardAndEdgeCaseTests"
dotnet test --filter "FullyQualifiedName~ParameterizedScoringTests"
```

### Par cas de test (TC-xxx)
```bash
dotnet test --filter "Trait~TC-001"
dotnet test --filter "Trait~TC-022"
```

### Par exigence (REQ-xxx)
```bash
dotnet test --filter "Trait~REQ-E-001"
dotnet test --filter "Trait~REQ-E-013"
```

---

## Avec rapport de résultats (.trx)

Génère un fichier de résultats lisible par Rider, Visual Studio ou la CI :

```bash
dotnet test EscrimeGame.sln \
  --logger "trx;LogFileName=test-results.trx" \
  --results-directory ./TestResults
```

Le fichier est créé dans `TestResults/test-results.trx`.

---

## Avec couverture de code

### Générer la couverture (format Cobertura)
```bash
dotnet test EscrimeGame.sln \
  --collect:"XPlat Code Coverage" \
  --results-directory ./TestResults \
  -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=cobertura
```

Le fichier XML est créé dans `TestResults/<guid>/coverage.cobertura.xml`.

### Générer un rapport HTML lisible

Installe l'outil une seule fois :
```bash
dotnet tool install -g dotnet-reportgenerator-globaltool
```

Puis génère le rapport :
```bash
reportgenerator \
  -reports:"TestResults/**/coverage.cobertura.xml" \
  -targetdir:"TestResults/CoverageReport" \
  -reporttypes:"Html"
```

Ouvre ensuite `TestResults/CoverageReport/index.html` dans ton navigateur.

---

## Verbosité

| Option | Description |
|--------|-------------|
| `-v q` | Quiet — affiche uniquement le résumé final |
| `-v n` | Normal (défaut) |
| `-v d` | Detailed — affiche chaque test |
| `-v diag` | Diagnostic — logs complets |

```bash
# Exemple : résumé court
dotnet test EscrimeGame.Tests/EscrimeGame.Tests.csproj -v q
```

---

## Structure des tests

```
EscrimeGame.Tests/
├── ScoreCalculator/
│   ├── BaseScoringTests.cs          # REQ-E-001, REQ-E-002 — victoire, défaite, nul
│   ├── StreakBonusTests.cs          # REQ-E-004 — bonus série de 3 victoires
│   ├── DisqualificationTests.cs    # REQ-E-005 — disqualification remet le score à 0
│   ├── PenaltyTests.cs             # REQ-E-006 — pénalités (plancher à 0)
│   ├── GuardAndEdgeCaseTests.cs    # REQ-E-007/008/009 — cas limites et exceptions
│   └── ParameterizedScoringTests.cs # REQ-E-010 — scénarios paramétrés multiples
└── TournamentRanking/
    ├── RankingTests.cs             # REQ-E-011/012 — classement décroissant, tri stable
    └── ChampionTests.cs            # REQ-E-013/016 — champion, cas tous disqualifiés
```