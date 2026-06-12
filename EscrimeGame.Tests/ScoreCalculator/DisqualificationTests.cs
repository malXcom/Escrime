using EscrimeGame;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class DisqualificationTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    [Trait("Requirement", "REQ-E-005")]
    [Trait("TestCase", "TC-010")]
    public void CalculateScore_DisqualifiedWithPositiveScore_ReturnsZero()
    {
        var matches = new List<MatchResult> { Win, Win, Win };

        var score = _calculator.CalculateScore(matches, isDisqualified: true);

        score.Should().Be(0, "la disqualification annule un score pourtant positif (14)");
    }

    [Fact]
    [Trait("Requirement", "REQ-E-005")]
    [Trait("TestCase", "TC-011")]
    public void CalculateScore_DisqualifiedWithNoMatches_ReturnsZero()
    {
        var matches = new List<MatchResult>();

        var score = _calculator.CalculateScore(matches, isDisqualified: true);

        score.Should().Be(0);
    }
}
