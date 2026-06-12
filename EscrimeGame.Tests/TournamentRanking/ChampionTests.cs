using FluentAssertions;
using Xunit;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class ChampionTests
{
    private readonly ScoreCalculator _calculator = new();
    private readonly TournamentRanking _ranking;

    public ChampionTests()
    {
        _ranking = new TournamentRanking(_calculator);
    }

    [Fact]
    [Trait("Requirement", "REQ-E-013")]
    [Trait("TestCase", "TC-025")]
    public void GetChampion_AllPlayersDisqualified_ChampionScoreIsZero()
    {
        var players = new List<Player>
        {
            new() { Name = "Sir Galahad", Matches = new List<MatchResult> { Win, Win, Win }, IsDisqualified = true },
            new() { Name = "Lancelot", Matches = new List<MatchResult> { Win, Win }, IsDisqualified = true },
            new() { Name = "Dame Morgane", Matches = new List<MatchResult> { Win }, IsDisqualified = true }
        };

        var champion = _ranking.GetChampion(players);

        champion.Should().NotBeNull();

        var championScore = _calculator.CalculateScore(
            champion!.Matches,
            champion.IsDisqualified,
            champion.PenaltyPoints);

        championScore.Should().Be(0, "tous disqualifiés → meilleur score possible = 0");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-013")]
    [Trait("TestCase", "TC-026")]
    public void GetChampion_PlayersWithIds_ChampionHasValidId()
    {
        var match = new MatchResult { Outcome = MatchResult.Result.Win };
        var players = new List<Player>
        {
            new() { Id = 1, Name = "Sir Galahad", Matches = new List<MatchResult> { match } },
            new() { Id = 2, Name = "Lancelot", Matches = new List<MatchResult>() }
        };

        var champion = _ranking.GetChampion(players);

        champion.Should().NotBeNull();
        champion!.Id.Should().Be(1, "le champion est le joueur avec l'Id 1 (meilleur score)");
    }
}