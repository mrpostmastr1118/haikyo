import PageLayout from '@/components/PageLayout';

export const metadata = {
  title: 'プライバシーポリシー — PATINA',
};

export default function PrivacyPage() {
  return (
    <PageLayout title="プライバシーポリシー" subtitle="Privacy Policy">
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>最終更新日：2026年6月6日</p>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        1. 基本方針
      </h2>
      <p>
        PATINA（以下「当サイト」）は、利用者の個人情報の保護を重要な責務と認識し、適切な管理・利用に努めます。
      </p>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        2. 収集する情報
      </h2>
      <p>当サイトでは以下の情報を収集することがあります。</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>お問い合わせフォームからご入力いただいた氏名・メールアドレス・メッセージ内容</li>
        <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
        <li>Cookieによる匿名のアクセス解析データ</li>
      </ul>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        3. 情報の利用目的
      </h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>お問い合わせへの回答・対応</li>
        <li>サイトの改善・品質向上のための分析</li>
        <li>不正アクセスの検知・防止</li>
      </ul>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        4. 第三者への提供
      </h2>
      <p>
        法令に基づく場合を除き、収集した個人情報を第三者に提供・開示することはありません。
      </p>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        5. Cookieおよびアクセス解析について
      </h2>
      <p>
        当サイトはGoogle Analyticsなどのアクセス解析ツールを使用する場合があります。これらのツールはCookieを使用して匿名のアクセス情報を収集します。収集されるデータには個人を特定する情報は含まれません。ブラウザの設定でCookieを無効にすることが可能です。
      </p>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        6. 著作権
      </h2>
      <p>
        当サイトに掲載しているテキスト・写真・地図データの著作権は、各権利者に帰属します。無断での転載・複製・二次利用を禁じます。
      </p>

      <h2 className="text-base pt-2" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        7. お問い合わせ
      </h2>
      <p>
        個人情報の取り扱いに関するご質問・ご要望は、<a href="/contact" style={{ color: 'var(--accent)' }}>お問い合わせフォーム</a>よりご連絡ください。
      </p>
    </PageLayout>
  );
}
