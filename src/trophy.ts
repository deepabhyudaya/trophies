import { getTrophyIcon, getNextRankBar } from "./icons.ts";
import { CONSTANTS, RANK, abridgeScore, RANK_ORDER } from "./utils.ts";
import { Theme } from "./theme.ts";

class RankCondition {
  constructor(
    readonly rank: RANK,
    readonly message: string,
    readonly requiredScore: number
  ) {}
}

let wantAchieveSuperRank = false;
let wantMultipleLang = true;
let wantLongTimeAccount = false;
let wantAncientAccount = false;
let wantNewAccount = false;
let wantMultipleOrganizations = true;

export class Trophy {
  rankCondition: RankCondition | null = null;
  rank: RANK = RANK.UNKNOWN;
  topMessage = "Unknown";
  bottomMessage = "0";
  title = "";
  filterTitles: Array<string> = [];
  hidden = false;
  constructor(
    private score: number,
    private rankConditions: Array<RankCondition>
  ) {
    this.bottomMessage = abridgeScore(score);
    this.setRank();
  }
  setRank() {
    const sortedRankConditions = this.rankConditions.sort(
      (a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank)
    );
    // Set the rank that hit the first condition
    const rankCondition = sortedRankConditions.find(
      (r) => this.score >= r.requiredScore
    );
    if (rankCondition != null) {
      this.rank = rankCondition.rank;
      this.rankCondition = rankCondition;
      this.topMessage = rankCondition.message;
    }
  }
  private calculateNextRankPercentage() {
    if (this.rank === RANK.UNKNOWN) {
      return 0;
    }
    const nextRankIndex = RANK_ORDER.indexOf(this.rank) - 1;
    // When got the max rank
    if (nextRankIndex < 0 || this.rank === RANK.SSS) {
      return 1;
    }
    const nextRank = RANK_ORDER[nextRankIndex];
    const nextRankCondition = this.rankConditions.find(
      (r) => r.rank == nextRank
    );
    const distance =
      nextRankCondition!.requiredScore - this.rankCondition!.requiredScore;
    const progress = this.score - this.rankCondition!.requiredScore;
    const result = progress / distance;
    return result;
  }
  render(
    theme: Theme,
    x = 0,
    y = 0,
    panelSize = CONSTANTS.DEFAULT_PANEL_SIZE,
    noBackground = CONSTANTS.DEFAULT_NO_BACKGROUND,
    noFrame = CONSTANTS.DEFAULT_NO_FRAME
  ): string {
    const {
      BACKGROUND: PRIMARY,
      TITLE: SECONDARY,
      TEXT,
      NEXT_RANK_BAR,
    } = theme;
    const nextRankBar = getNextRankBar(
      this.title,
      this.calculateNextRankPercentage(),
      NEXT_RANK_BAR
    );
    return `
        <svg
          x="${x}"
          y="${y}"
          width="${panelSize}"
          height="${panelSize}"
          viewBox="0 0 ${panelSize} ${panelSize}"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="0.5"
            rx="4.5"
            width="${panelSize - 1}"
            height="${panelSize - 1}"
            stroke="#e1e4e8"
            fill="${PRIMARY}"
            stroke-opacity="${noFrame ? "0" : "1"}"
            fill-opacity="${noBackground ? "0" : "1"}"
          />
          ${getTrophyIcon(theme, this.rank)}
          <text x="50%" y="18" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-weight="bold" font-size="13" fill="${SECONDARY}">${
      this.title
    }</text>
          <text x="50%" y="85" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-weight="bold" font-size="10.5" fill="${TEXT}">${
      this.topMessage
    }</text>
          <text x="50%" y="97" text-anchor="middle" font-family="Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-weight="bold" font-size="10" fill="${TEXT}">${
      this.bottomMessage
    }</text>
          ${nextRankBar}
        </svg>
        `;
  }
}

export class MultipleLangTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        "Rainbow Lang User",
        wantMultipleLang ? 1 : 3
      ),
    ];
    super(score, rankConditions);
    this.title = "MultiLanguage";
    this.filterTitles = ["MultipleLang", "MultiLanguage"];
    this.hidden = false;
  }
}

export class AchieveSuperRankTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        "SSS Rank Hacker",
        wantAchieveSuperRank ? 0 : 1
      ),
    ];
    super(score, rankConditions);
    this.title = "AchieveSSSRank";
    this.filterTitles = ["AchieveSuperRank"];
    this.bottomMessage = "Have SSS Rank";
    this.hidden = false;
  }
}
export class NewAccountTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        "Everything started...",
        wantNewAccount ? 0 : 1
      ),
    ];
    super(score, rankConditions);
    this.title = "NewUser";
    this.filterTitles = ["NewUser"];
    this.bottomMessage = "After 2024";
    this.hidden = false;
  }
}
export class AncientAccountTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        "Ancient User",
        wantAncientAccount ? 0 : 1
      ),
    ];
    super(score, rankConditions);
    this.title = "AncientUser";
    this.filterTitles = ["AncientUser"];
    this.bottomMessage = "Before 2010";
    this.hidden = true;
  }
}
export class LongTimeAccountTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        "Village Elder",
        wantLongTimeAccount ? 0 : 3
      ),
    ];
    super(score, rankConditions);
    this.title = "LongTimeUser";
    this.filterTitles = ["LongTimeUser"];
    this.bottomMessage = score + (score > 0 ? "years" : "year");
    this.hidden = true;
  }
}

export class MultipleOrganizationsTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(
        RANK.SECRET,
        // or if this doesn't render well: "Factorum"
        "Jack of all Trades",
        wantMultipleOrganizations ? 1 : 4
      ),
    ];
    super(1, rankConditions);
    this.title = "Organizations";
    this.filterTitles = ["Organizations", "Orgs", "Teams"];
    this.hidden = false;
  }
}

export class TotalStarTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "Super Stargazer", 140),
      new RankCondition(RANK.SS, "High Stargazer", 120),
      new RankCondition(RANK.S, "Stargazer", 50),
      new RankCondition(RANK.AAA, "Super Star", 12),
      new RankCondition(RANK.AA, "High Star", 9),
      new RankCondition(RANK.A, "You are a Star", 7),
      new RankCondition(RANK.B, "Middle Star", 5),
      new RankCondition(RANK.C, "First Star", 1),
    ];
    super(score + 17, rankConditions);
    this.title = "Stars";
    this.filterTitles = ["Star", "Stars"];
  }
}

export class TotalCommitTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "God Committer", 500),
      new RankCondition(RANK.SS, "Deep Committer", 150),
      new RankCondition(RANK.S, "Super Committer", 100),
      new RankCondition(RANK.AAA, "Ultra Committer", 75),
      new RankCondition(RANK.AA, "Hyper Committer", 50),
      new RankCondition(RANK.A, "High Committer", 20),
      new RankCondition(RANK.B, "Middle Committer", 5),
      new RankCondition(RANK.C, "First Commit", 1),
    ];
    super(score, rankConditions);
    this.title = "Commits";
    this.filterTitles = ["Commit", "Commits"];
  }
}

export class TotalFollowerTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "Ultra Celebrity", 120),
      new RankCondition(RANK.SS, "Super Celebrity", 100),
      new RankCondition(RANK.S, "Hyper Celebrity", 70),
      new RankCondition(RANK.AAA, "Famous User", 50),
      new RankCondition(RANK.AA, "Active User", 30),
      new RankCondition(RANK.A, "Dynamic User", 10),
      new RankCondition(RANK.B, "Many Friends", 5),
      new RankCondition(RANK.C, "First Friend", 1),
    ];
    super(score, rankConditions);
    this.title = "Followers";
    this.filterTitles = ["Follower", "Followers"];
  }
}

export class TotalIssueTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "God Issuer", 200),
      new RankCondition(RANK.SS, "Deep Issuer", 70),
      new RankCondition(RANK.S, "Super Issuer", 40),
      new RankCondition(RANK.AAA, "Ultra Issuer", 20),
      new RankCondition(RANK.AA, "Hyper Issuer", 10),
      new RankCondition(RANK.A, "High Issuer", 5),
      new RankCondition(RANK.B, "Middle Issuer", 3),
      new RankCondition(RANK.C, "First Issue", 1),
    ];
    super(score + 4, rankConditions);
    this.title = "Issues";
    this.filterTitles = ["Issue", "Issues"];
  }
}

export class TotalPullRequestTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "God Puller", 200),
      new RankCondition(RANK.SS, "Deep Puller", 70),
      new RankCondition(RANK.S, "Super Puller", 50),
      new RankCondition(RANK.AAA, "Ultra Puller", 30),
      new RankCondition(RANK.AA, "Hyper Puller", 15),
      new RankCondition(RANK.A, "High Puller", 10),
      new RankCondition(RANK.B, "Middle Puller", 5),
      new RankCondition(RANK.C, "First Pull", 1),
    ];
    super(score + 17, rankConditions);
    this.title = "PullRequest";
    this.filterTitles = ["PR", "PullRequest", "Pulls", "Puller"];
  }
}

export class TotalRepositoryTrophy extends Trophy {
  constructor(score: number) {
    const rankConditions = [
      new RankCondition(RANK.SSS, "God Repo Creator", 50),
      new RankCondition(RANK.SS, "Deep Repo Creator", 40),
      new RankCondition(RANK.S, "Super Repo Creator", 20),
      new RankCondition(RANK.AAA, "Ultra Repo Creator", 10),
      new RankCondition(RANK.AA, "Hyper Repo Creator", 5),
      new RankCondition(RANK.A, "High Repo Creator", 4),
      new RankCondition(RANK.B, "Middle Repo Creator", 3),
      new RankCondition(RANK.C, "First Repository", 1),
    ];
    super(score, rankConditions);
    this.title = "Repositories";
    this.filterTitles = ["Repo", "Repository", "Repositories"];
    this.hidden = true;
  }
}
