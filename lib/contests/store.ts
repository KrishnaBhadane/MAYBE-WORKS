export type ContestQuestionType = "mcq" | "dsa" | "sql";

export interface ContestMcqQuestion {
  id: string;
  type: "mcq";
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface ContestDsaQuestion {
  id: string;
  type: "dsa";
  title: string;
  description: string;
  starterCode: string;
  language: string;
  sampleTestcases: Array<{ input: string; expectedOutput: string }>;
  hiddenTestcases: Array<{ input: string; expectedOutput: string }>;
  points: number;
}

export interface ContestSqlQuestion {
  id: string;
  type: "sql";
  title: string;
  description: string;
  schemaSql: string;
  starterQuery: string;
  expectedRows: Array<Record<string, unknown>>;
  points: number;
}

export type ContestQuestion = ContestMcqQuestion | ContestDsaQuestion | ContestSqlQuestion;

export interface Contest {
  id: string;
  title: string;
  description: string;
  accessCode: string;
  durationMinutes: number;
  tabSwitchPenalty: number;
  createdAt: string;
  status: "active" | "ended";
  questions: ContestQuestion[];
}

export interface ContestParticipant {
  id: string;
  contestId: string;
  userEmail: string;
  userName: string;
  joinedAt: string;
  status: "active" | "flagged" | "kicked" | "submitted";
  score: number;
  penalties: number;
  netScore: number;
  tabSwitches: number;
  totalTimeAwaySeconds: number;
  clipboardViolations: number;
  lastActiveAt: string;
  answeredQuestions: Record<string, {
    solved: boolean;
    points: number;
    submittedAt?: string;
  }>;
}

export interface ContestViolationEvent {
  id: string;
  contestId: string;
  userEmail: string;
  timestamp: string;
  type: "tab_switch" | "clipboard_copy" | "clipboard_paste" | "devtools_attempt";
  durationSeconds?: number;
  penaltyApplied: number;
  details: string;
}

// In-Memory Global Store with Default Starter Contest
class ContestStore {
  private contests: Map<string, Contest> = new Map();
  private participants: Map<string, ContestParticipant[]> = new Map();
  private violations: Map<string, ContestViolationEvent[]> = new Map();

  constructor() {
    this.seedDefaultContest();
  }

  private seedDefaultContest() {
    const starterContest: Contest = {
      id: "weekly-systems-1",
      title: "Weekly Systems & Algorithmic Contest #1",
      description: "CodeChef & REA proctored round featuring C++ algorithmic invariants, SQLite query optimization, and memory hierarchy architecture.",
      accessCode: "CODE-2026",
      durationMinutes: 45,
      tabSwitchPenalty: 5,
      createdAt: new Date().toISOString(),
      status: "active",
      questions: [
        {
          id: "q-1",
          type: "mcq",
          title: "Memory Hierarchy & Cache Line Invariants",
          question: "When traversing a row-major contiguous 2D array in C++, which iteration order guarantees L1/L2 cache hit maximization?",
          options: [
            "Iterating outer loop by column j, inner loop by row i (nums[i][j])",
            "Iterating outer loop by row i, inner loop by column j (nums[i][j])",
            "Diagonal strided access with dynamic jumps",
            "Morton Z-order curve index computation"
          ],
          correctIndex: 1,
          explanation: "In C++, 2D arrays are stored in row-major order contiguous memory strides. Iterating row by row guarantees consecutive cache line spatial locality.",
          points: 25,
        },
        {
          id: "q-2",
          type: "dsa",
          title: "Minimum Window Substring Invariant",
          description: "### Problem Statement\nGiven two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.\n\n### Constraints\n- `1 <= s.length, t.length <= 10^5`\n- Time Complexity: O(N) sliding window\n\n### Sample Input\nADOBECODEBANC\nABC\n\n### Sample Output\nBANC",
          starterCode: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

string minWindow(string s, string t) {
    // Write your optimal sliding window solution here
    return "";
}

int main() {
    string s, t;
    if (cin >> s >> t) {
        cout << minWindow(s, t) << endl;
    }
    return 0;
}`,
          language: "cpp",
          sampleTestcases: [
            { input: "ADOBECODEBANC ABC", expectedOutput: "BANC" },
            { input: "a a", expectedOutput: "a" }
          ],
          hiddenTestcases: [
            { input: "a aa", expectedOutput: "" }
          ],
          points: 50,
        },
        {
          id: "q-3",
          type: "sql",
          title: "High-Frequency Transaction Anomaly Query",
          description: "### Task Requirement\nIdentify high-frequency customer accounts that performed more than 2 transactions within the telemetry window.\n\n### Target Schema\n`transactions(id INT, account_id INT, amount DECIMAL, status TEXT)`\n\n### Output Format\nColumns: `account_id`, `tx_count` ordered by `tx_count DESC`.",
          schemaSql: `CREATE TABLE transactions (id INT, account_id INT, amount DECIMAL, status TEXT);
INSERT INTO transactions VALUES (1, 101, 450.00, 'cleared');
INSERT INTO transactions VALUES (2, 102, 120.00, 'cleared');
INSERT INTO transactions VALUES (3, 101, 99.50, 'cleared');
INSERT INTO transactions VALUES (4, 101, 210.00, 'cleared');
INSERT INTO transactions VALUES (5, 103, 50.00, 'cleared');`,
          starterQuery: "SELECT account_id, COUNT(*) as tx_count FROM transactions GROUP BY account_id HAVING COUNT(*) > 2 ORDER BY tx_count DESC;",
          expectedRows: [
            { account_id: 101, tx_count: 3 }
          ],
          points: 25,
        }
      ]
    };

    this.contests.set(starterContest.id, starterContest);
    this.participants.set(starterContest.id, [
      {
        id: "p-mock-1",
        contestId: starterContest.id,
        userEmail: "alex.chen@kernel.org",
        userName: "Alex Chen",
        joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        status: "active",
        score: 75,
        penalties: 0,
        netScore: 75,
        tabSwitches: 0,
        totalTimeAwaySeconds: 0,
        clipboardViolations: 0,
        lastActiveAt: new Date().toISOString(),
        answeredQuestions: {
          "q-1": { solved: true, points: 25 },
          "q-2": { solved: true, points: 50 },
        }
      },
      {
        id: "p-mock-2",
        contestId: starterContest.id,
        userEmail: "samantha.dev@mit.edu",
        userName: "Samantha Miller",
        joinedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        status: "flagged",
        score: 50,
        penalties: 10,
        netScore: 40,
        tabSwitches: 2,
        totalTimeAwaySeconds: 8.4,
        clipboardViolations: 1,
        lastActiveAt: new Date().toISOString(),
        answeredQuestions: {
          "q-1": { solved: true, points: 25 },
          "q-3": { solved: true, points: 25 },
        }
      }
    ]);
  }

  // Contests
  public getContests(): Contest[] {
    return Array.from(this.contests.values());
  }

  public getContestById(id: string): Contest | undefined {
    return this.contests.get(id);
  }

  public getContestByCode(code: string): Contest | undefined {
    const clean = code.trim().toUpperCase();
    return Array.from(this.contests.values()).find(
      (c) => c.accessCode.trim().toUpperCase() === clean
    );
  }

  public createContest(contest: Contest): Contest {
    this.contests.set(contest.id, contest);
    if (!this.participants.has(contest.id)) {
      this.participants.set(contest.id, []);
    }
    return contest;
  }

  // Participants
  public getParticipants(contestId: string): ContestParticipant[] {
    return this.participants.get(contestId) || [];
  }

  public joinContest(
    contestId: string,
    userEmail: string,
    userName: string
  ): ContestParticipant {
    const list = this.participants.get(contestId) || [];
    let existing = list.find((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase());

    if (!existing) {
      existing = {
        id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        contestId,
        userEmail,
        userName: userName || userEmail.split("@")[0],
        joinedAt: new Date().toISOString(),
        status: "active",
        score: 0,
        penalties: 0,
        netScore: 0,
        tabSwitches: 0,
        totalTimeAwaySeconds: 0,
        clipboardViolations: 0,
        lastActiveAt: new Date().toISOString(),
        answeredQuestions: {},
      };
      list.push(existing);
      this.participants.set(contestId, list);
    }
    return existing;
  }

  public kickParticipant(contestId: string, userEmail: string): boolean {
    const list = this.participants.get(contestId);
    if (!list) return false;
    const target = list.find((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase());
    if (target) {
      target.status = "kicked";
      target.lastActiveAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public recordViolation(
    contestId: string,
    userEmail: string,
    violationType: "tab_switch" | "clipboard_copy" | "clipboard_paste" | "devtools_attempt",
    durationSeconds = 0
  ): { participant: ContestParticipant | null; event: ContestViolationEvent } {
    const contest = this.contests.get(contestId);
    const penaltyAmount = contest ? contest.tabSwitchPenalty : 5;

    const event: ContestViolationEvent = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      contestId,
      userEmail,
      timestamp: new Date().toISOString(),
      type: violationType,
      durationSeconds,
      penaltyApplied: penaltyAmount,
      details: violationType === "tab_switch"
        ? `Tab switched away for ${durationSeconds.toFixed(1)}s (-${penaltyAmount} pts)`
        : `Unauthorized clipboard action blocked (-${penaltyAmount} pts)`
    };

    const violationsList = this.violations.get(contestId) || [];
    violationsList.unshift(event);
    this.violations.set(contestId, violationsList);

    const list = this.participants.get(contestId) || [];
    const participant = list.find((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase());

    if (participant && participant.status !== "kicked") {
      if (violationType === "tab_switch") {
        participant.tabSwitches += 1;
        participant.totalTimeAwaySeconds += durationSeconds;
      } else {
        participant.clipboardViolations += 1;
      }

      participant.penalties += penaltyAmount;
      participant.netScore = Math.max(0, participant.score - participant.penalties);
      participant.status = participant.tabSwitches >= 3 ? "flagged" : participant.status;
      participant.lastActiveAt = new Date().toISOString();
    }

    return { participant: participant || null, event };
  }

  public submitAnswer(
    contestId: string,
    userEmail: string,
    questionId: string,
    pointsAwarded: number
  ): ContestParticipant | null {
    const list = this.participants.get(contestId) || [];
    const participant = list.find((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase());
    if (!participant || participant.status === "kicked") return null;

    if (!participant.answeredQuestions[questionId]?.solved) {
      participant.answeredQuestions[questionId] = {
        solved: true,
        points: pointsAwarded,
        submittedAt: new Date().toISOString(),
      };
      participant.score += pointsAwarded;
      participant.netScore = Math.max(0, participant.score - participant.penalties);
      participant.lastActiveAt = new Date().toISOString();
    }

    return participant;
  }

  public getViolations(contestId: string): ContestViolationEvent[] {
    return this.violations.get(contestId) || [];
  }
}

// Global Singleton Store
const globalForContests = globalThis as unknown as { contestStore?: ContestStore };
export const contestStore = globalForContests.contestStore || new ContestStore();
if (process.env.NODE_ENV !== "production") {
  globalForContests.contestStore = contestStore;
}
