using System;
using System.Collections.Generic;

namespace EscrimeGame;

public class TournamentRanking
{
    private readonly ScoreCalculator _scoreCalculator;

    public TournamentRanking(ScoreCalculator scoreCalculator)
    {
        _scoreCalculator = scoreCalculator;
    }

    /// <summary>
    /// Classe les joueurs par score décroissant
    /// </summary>
    public List<Player> GetRanking(List<Player> players)
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// Trouve le champion (joueur avec le meilleur score)
    /// </summary>
    public Player? GetChampion(List<Player> players)
    {
        throw new NotImplementedException();
    }
}