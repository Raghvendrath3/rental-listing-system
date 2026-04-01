import Link from 'next/link';
import { SignupResponseData } from '@/types/auth.types';

interface Props {
  data: SignupResponseData;
}

export default function SignupSuccess({ data }: Props) {
  return (
    <div className="success-card">
      <div className="success-icon" aria-hidden="true">✓</div>
      <h2 className="success-title">Account Created</h2>
      <p className="success-sub">Welcome aboard, {data.email}</p>
      <div className="success-meta">
        <span className="meta-pill">ID #{data.id}</span>
        <span className="meta-pill">{data.role}</span>
      </div>
      <Link href="/auth/login" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'block', textAlign: 'center' }}>
        Sign In →
      </Link>
    </div>
  );
}