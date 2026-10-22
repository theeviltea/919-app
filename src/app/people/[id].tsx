import { CandidateProfile } from '@/features/talent/CandidateProfile';

/** Someone else's profile opened from People (SeekPeopleProfile): the employer view without save, CV or contact. */
export default function PeopleProfileScreen() {
  return <CandidateProfile viewer="seeker" />;
}
