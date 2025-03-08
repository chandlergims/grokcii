declare module '@g-loot/react-tournament-brackets' {
  export interface Participant {
    id: string;
    resultText?: string;
    isWinner?: boolean;
    status?: string | null;
    name?: string;
  }

  export interface Match {
    id: number;
    name?: string;
    nextMatchId?: number | null;
    tournamentRoundText?: string;
    startTime?: string;
    state?: string;
    participants: Participant[];
  }

  export interface ThemeOptions {
    textColor: { main: string; highlighted: string; dark: string };
    matchBackground: { wonColor: string; lostColor: string };
    score: { background: { wonColor: string; lostColor: string } };
    border: { color: string; highlightedColor: string };
    roundHeader: { backgroundColor: string; color: string };
    connectorColor: string;
    connectorColorHighlight: string;
    svgBackground: string;
  }

  export interface SVGViewerProps {
    children: React.ReactNode;
    width: number;
    height: number;
    background?: string;
    SVGBackground?: string;
    minimap?: boolean;
    tool?: string;
    [key: string]: any;
  }

  export function createTheme(options: Partial<ThemeOptions>): ThemeOptions;
  
  export const Match: React.FC<any>;
  
  export const SVGViewer: React.FC<SVGViewerProps>;
  
  export interface SingleEliminationBracketProps {
    matches: Match[];
    matchComponent: React.ComponentType<any>;
    theme?: ThemeOptions;
    options?: {
      style?: {
        roundHeader?: {
          backgroundColor?: string;
          color?: string;
          fontWeight?: string;
        };
        connectorColor?: string;
        connectorColorHighlight?: string;
      };
    };
    svgWrapper?: (props: { children: React.ReactNode; [key: string]: any }) => React.ReactElement;
  }
  
  export const SingleEliminationBracket: React.FC<SingleEliminationBracketProps>;
}
