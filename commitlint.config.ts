import {
  RuleConfigSeverity,
  type Plugin,
  type RuleConfigTuple,
  type UserConfig,
} from '@commitlint/types';

const REQ_PATTERN = /^REQ-[A-Z]-\d{3}$/; // ex: REQ-A-001
const TC_PATTERN = /^TC-\d{3}$/;         // ex: TC-001
const TC_TOKEN = /TC-[A-Za-z0-9]+/g;
const TDD_TYPES = ['red', 'green'];

const tddPlugin: Plugin = {
  rules: {
    'tdd/req-scope': ({ type, scope }) => {
      if (!type || !TDD_TYPES.includes(type)) return [true];
      return [
        scope != null && REQ_PATTERN.test(scope),
        `un commit "${type}" doit cibler un REQ valide, ex: ${type}(REQ-A-001): ...`,
      ];
    },
    'tdd/red-requires-tc': ({ type, header, body }) => {
      if (type !== 'red') return [true];
      const text = `${header ?? ''}\n${body ?? ''}`;
      return [
        (text.match(TC_TOKEN) ?? []).some((tc) => TC_PATTERN.test(tc)),
        'un commit "red" doit référencer au moins un cas de test, ex: TC-001',
      ];
    },
    'tdd/tc-format': ({ header, body }) => {
      const text = `${header ?? ''}\n${body ?? ''}`;
      const bad = (text.match(TC_TOKEN) ?? []).filter((tc) => !TC_PATTERN.test(tc));
      return [
        bad.length === 0,
        `cas de test mal formé(s): ${bad.join(', ')} (attendu: TC-001)`,
      ];
    },
  },
};

// Règles standards (typées) + règles personnalisées "tdd/*"
const rules: NonNullable<UserConfig['rules']> &
  Record<`tdd/${string}`, RuleConfigTuple<void>> = {
  'type-enum': [
    RuleConfigSeverity.Error,
    'always',
    ['red', 'green', 'refactor', 'chore', 'docs', 'ci', 'test', 'feat', 'fix'],
  ],
  'type-empty': [RuleConfigSeverity.Error, 'never'],
  'subject-empty': [RuleConfigSeverity.Error, 'never'],
  'scope-case': [RuleConfigSeverity.Disabled],
  'subject-case': [RuleConfigSeverity.Disabled],
  'tdd/req-scope': [RuleConfigSeverity.Error, 'always'],
  'tdd/red-requires-tc': [RuleConfigSeverity.Error, 'always'],
  'tdd/tc-format': [RuleConfigSeverity.Error, 'always'],
};

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [tddPlugin],
  rules,
};

export default Configuration;