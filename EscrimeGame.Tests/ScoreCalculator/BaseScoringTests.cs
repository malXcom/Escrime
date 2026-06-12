using EscrimeGame;
using FluentAssertions;
using Xunit;
using static EscrimeGame.Tests.MatchResults;
namespace EscrimeGame.Tests;
public class BaseScoringTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    [Trait("Requirement", "REQ-E-001")]
    [Trait("Requirement", "REQ-E-003")]
    [Trait("TestCase", "TC-001")]
    public void CalculateScore_WinDrawLoss_Returns4()
    {
        // Arrange
        var matches = new List<MatchResult> { Win, Draw, Loss };

        // Act
        var score = _calculator.CalculateScore(matches);

        // Assert
        score.Should().Be(4, "Win=3 + Draw=1 + Loss=0");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-001")]
    [Trait("Requirement", "REQ-E-003")]
    [Trait("TestCase", "TC-002")]
    public void CalculateScore_TwoWins_Returns6()
    {
        var matches = new List<MatchResult> { Win, Win };

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(6, "2 victoires × 3 ; le bonus de série n'apparaît qu'à partir de 3 victoires");
    }
}
