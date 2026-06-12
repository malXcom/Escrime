using EscrimeGame;
using FluentAssertions;
using Xunit;
using System.Collections.Generic;
using static EscrimeGame.Tests.MatchResults;

namespace EscrimeGame.Tests;

public class ParameterizedScoringTests
{
    private readonly ScoreCalculator _calculator = new();

    public static IEnumerable<object[]> ScoreScenarios()
    {
        yield return new object[] { new List<MatchResult> { Win, Draw, Loss }, 4 };
        yield return new object[] { new List<MatchResult> { Loss, Loss }, 0 };
        yield return new object[] { new List<MatchResult> { Win, Win }, 6 };
        yield return new object[] { new List<MatchResult> { Win, Win, Win }, 14 };
    }

    [Theory]
    [MemberData(nameof(ScoreScenarios))]
    [Trait("Requirement", "REQ-E-010")]
    [Trait("TestCase", "TC-018")]
    public void CalculateScore_VariousScenarios_ReturnsExpected(List<MatchResult> matches, int expected)
    {
        var score = _calculator.CalculateScore(matches);

        score.Should().Be(expected);
    }
}
