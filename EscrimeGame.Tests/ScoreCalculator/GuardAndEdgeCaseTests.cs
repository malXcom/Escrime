using EscrimeGame;
using FluentAssertions;
using Xunit;
using System;
using System.Collections.Generic;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class GuardAndEdgeCaseTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    [Trait("Requirement", "REQ-E-007")]
    [Trait("TestCase", "TC-015")]
    public void CalculateScore_EmptyList_ReturnsZero()
    {
        var matches = new List<MatchResult>();

        var score = _calculator.CalculateScore(matches);

        score.Should().Be(0, "aucun combat → aucun point");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-008")]
    [Trait("TestCase", "TC-016")]
    public void CalculateScore_NullList_ThrowsArgumentNullException()
    {
        Action act = () => _calculator.CalculateScore(null!);

        act.Should().Throw<ArgumentNullException>()
           .WithParameterName("matches");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-009")]
    [Trait("TestCase", "TC-017")]
    public void CalculateScore_NegativePenalty_ThrowsArgumentException()
    {
        var matches = new List<MatchResult> { Win };

        Action act = () => _calculator.CalculateScore(matches, penaltyPoints: -5);

        act.Should().Throw<ArgumentException>()
           .WithParameterName("penaltyPoints");
    }
}
