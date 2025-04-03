import { Tournament } from '../../models/types';
import TournamentResults from '../shared/TournamentResults';

interface TournamentResultsTableProps {
    tournament: Tournament;
}

function TournamentResultsTable({ tournament }: TournamentResultsTableProps) {
    return <TournamentResults tournament={tournament} />;
}

export default TournamentResultsTable; 