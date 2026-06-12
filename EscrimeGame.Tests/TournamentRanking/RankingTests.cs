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
        var blackKnight = new Player { Name = "Chevalier Noir", Matches = new List<MatchResult> { Win, Win, Draw } };
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
        var lancelot = new Player { Name = "Lancelot", Matches = new List<MatchResult> { Win, Win } };

        var ranking = _ranking.GetRanking(new List<Player> { merlin, lancelot });

        ranking.Select(p => p.Name).Should().Equal(
            new[] { "Merlin", "Lancelot" },
            " égalité, l'ordre d'entrée doit être préservé (OrderByDescending est un tri stable)");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-012")]
    [Trait("TestCase", "TC-021")]
    public void GetChampion_ReturnsHighestScoringPlayer()
    {
        var merlin = new Player { Name = "Merlin", Matches = new List<MatchResult> { Win, Win, Win } };
        var blackKnight = new Player { Name = "Chevalier Noir", Matches = new List<MatchResult> { Win, Win, Draw } };
        var lancelot = new Player { Name = "Lancelot", Matches = new List<MatchResult> { Win, Draw, Loss } };

        var champion = _ranking.GetChampion(new List<Player> { merlin, blackKnight, lancelot });

        champion.Should().NotBeNull();
        champion!.Name.Should().Be("Merlin", "14 est le score le plus élevé");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-012")]
    [Trait("TestCase", "TC-022")]
    public void GetRanking_NullPlayers_ReturnsEmptyList()
    {
        var ranking = _ranking.GetRanking(null!);

        ranking.Should().NotBeNull();
        ranking.Should().BeEmpty("une liste null doit retourner une liste vide");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-012")]
    [Trait("TestCase", "TC-023")]
    public void GetChampion_NullPlayers_ReturnsNull()
    {
        var champion = _ranking.GetChampion(null!);

        champion.Should().BeNull("aucun champion possible si la liste est null");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-012")]
    [Trait("TestCase", "TC-024")]
    public void GetChampion_EmptyList_ReturnsNull()
    {
        var champion = _ranking.GetChampion(new List<Player>());

        champion.Should().BeNull("aucun champion possible si la liste est vide");
    }
}