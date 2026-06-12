using EscrimeGame;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class StreakBonusTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    [Trait("Requirement", "REQ-E-004")]
    [Trait("TestCase", "TC-005")]
    public void CalculateScore_ThreeConsecutiveWins_AddsFivePointBonus()
    {
        var matches = new List<MatchResult> { Win, Win, Win };

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(14, "9 points de victoires + 5 de bonus de série");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-004")]
    [Trait("TestCase", "TC-006")]
    public void CalculateScore_FourConsecutiveWins_AddsBonusOnce()
    {
        var matches = new List<MatchResult> { Win, Win, Win, Win };

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(17, "12 points + 5 de bonus accordé une seule fois pour la série");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-004")]
    [Trait("TestCase", "TC-007")]
    public void CalculateScore_InterruptedStreak_NoBonus()
    {
        var matches = new List<MatchResult> { Win, Win, Loss, Win };

        var score = _calculator.CalculateScore(matches);
        
        score.Should().Be(9, "la défaite interrompt la série → aucun bonus (3+3+0+3)");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-004")]
    [Trait("TestCase", "TC-008")]
    public void CalculateScore_WinsNotConsecutive_NoBonus()
    {
        var matches = new List<MatchResult> { Win, Draw, Win, Win };

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(10, "3+1+3+3 ; jamais 3 victoires d'affilée → pas de bonus");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-004")]
    [Trait("TestCase", "TC-009")]
    public void CalculateScore_TwoDistinctStreaks_AddsBonusForEach()
    {
        var matches = new List<MatchResult>
        {
            Win, Win, Win,
            Loss,
            Win, Win, Win, Win,
        };

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(31, "21 points (7 victoires) + 5 + 5 pour les deux séries");
    }
}
