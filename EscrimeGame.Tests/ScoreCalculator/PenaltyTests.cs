using EscrimeGame;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class PenaltyTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    [Trait("Requirement", "REQ-E-006")]
    [Trait("TestCase", "TC-012")]
    public void CalculateScore_PenaltiesBelowScore_AreSubtracted()
    {
        var matches = new List<MatchResult> { Win, Win, Draw };

        var score = _calculator.CalculateScore(matches, penaltyPoints: 3);

        score.Should().Be(4, "7 points - 3 de pénalité");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-006")]
    [Trait("TestCase", "TC-013")]
    public void CalculateScore_PenaltiesAboveScore_FloorAtZero()
    {
        var matches = new List<MatchResult> { Win, Draw };

        var score = _calculator.CalculateScore(matches, penaltyPoints: 10);

        score.Should().Be(0, "le score ne peut pas devenir négatif (plancher à 0)");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-006")]
    [Trait("TestCase", "TC-014")]
    public void CalculateScore_PenaltiesEqualScore_ReturnsZero()
    {
        var matches = new List<MatchResult> { Win, Win, Win };

        var score = _calculator.CalculateScore(matches, penaltyPoints: 14);

        score.Should().Be(0, "14 (9+5 bonus) - 14 = 0");
    }
}
