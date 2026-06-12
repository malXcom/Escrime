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
}
