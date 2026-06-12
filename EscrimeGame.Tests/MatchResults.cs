using EscrimeGame;

namespace EscrimeGame.Tests;

/// <summary>
/// Fabriques de <see cref="MatchResult"/> pour des tests lisibles :
/// on écrit <c>Win</c> / <c>Draw</c> / <c>Loss</c> au lieu de
/// <c>new MatchResult(MatchResult.Result.Win)</c>.
///
/// Usage : <c>using static EscrimeGame.Tests.MatchResults;</c>
/// </summary>
internal static class MatchResults
{
    public static MatchResult Win  => new(MatchResult.Result.Win);
    public static MatchResult Draw => new(MatchResult.Result.Draw);
    public static MatchResult Loss => new(MatchResult.Result.Loss);
}
