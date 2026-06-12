using EscrimeGame;
using FluentAssertions;
using Xunit;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class RankingTests
{
    private readonly TournamentRanking _ranking = new(new ScoreCalculator());

    [Fact]
    [Trait("Requirement", "REQ-E-011")]
    [Trait("TestCase", "TC-019")]
    public void GetRanking_ThreePlayers_OrdersByScoreDescending()
    {
        var merlin = new Player { Name = "Merlin", Matches = new List<MatchResult> { Win, Win, Win } };
        var blackKnight   = new Player { Name = "Chevalier Noir",   Matches = new List<MatchResult> { Win, Win, Draw } };
        var lancelot = new Player { Name = "Lancelot", Matches = new List<MatchResult> { Win, Draw, Loss } };
        
        var ranking = _ranking.GetRanking(new List<Player> { lancelot, merlin, blackKnight });

        ranking.Select(p => p.Name).Should().Equal("Merlin", "Chevalier Noir", "Lancelot");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-012")]
    [Trait("TestCase", "TC-020")]
    public void GetRanking_TiedScores_KeepsStableOrder()
    {
        var merlin = new Player { Name = "Merlin", Matches = new List<MatchResult> { Win, Win } };
        var lancelot   = new Player { Name = "Lancelot",   Matches = new List<MatchResult> { Win, Win } };

        var ranking = _ranking.GetRanking(new List<Player> { merlin, lancelot });

        ranking.Select(p => p.Name).Should().Equal(
            new[] { "Merlin", "Lancelot" },
            " ǸgalitǸ, l'ordre d'entrǸe doit Ǧtre prǸservǸ (OrderByDescending est un tri stable)");
    }
    
    [Fact]
    [Trait("Requirement", "REQ-E-013")]
    [Trait("TestCase", "TC-021")]
    public void GetChampion_ReturnsHighestScoringPlayer()
    {
        var merlin = new Player { Name = "Merlin", Matches = new List<MatchResult> { Win, Win, Win } };
        var blackKnight   = new Player { Name = "Chevalier Noir",   Matches = new List<MatchResult> { Win, Win, Draw } };
        var lancelot = new Player { Name = "Lancelot", Matches = new List<MatchResult> { Win, Draw, Loss } };

        var champion = _ranking.GetChampion(new List<Player> { merlin, blackKnight, lancelot });

        champion.Should().NotBeNull();
        champion!.Name.Should().Be("Merlin", "14 est le score le plus élevé");
    }
}