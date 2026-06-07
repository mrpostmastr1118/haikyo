import PageLayout from '@/components/PageLayout';

export const metadata = {
  title: 'About — 不思議な空間をまとめているブログ',
};

export default function AboutPage() {
  return (
    <PageLayout title="このサイトについて" subtitle="About 不思議な空間をまとめているブログ">
      <p>
        不思議な空間をまとめているブログは、廃墟・廃村・遺構・古城といった「時の痕跡」を持つ場所を、地図を通じて記録するトラベルログです。
      </p>
      <p>
        このサイトが伝えたいのは、「怖さ」でも「危険さ」でもありません。人が去り、自然が戻り、時間が堆積した場所に宿る——静けさ、神聖さ、未知への問い。そういった感覚を共有したいと思っています。
      </p>
      <p>
        左の地図上で塗りつぶされた地域をクリックすると、その場所の記録が右側に表示されます。記事をクリックすると詳細を読むことができます。
      </p>

      <h2 className="text-base pt-4" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        コンセプト
      </h2>
      <ul className="list-none space-y-2 pl-0">
        {['神聖 — 人が去った場所に宿る、静かな荘厳さ', '未知 — まだ誰も言語化していない感覚への探求', '調和 — 自然と人工物が溶け合う過程の美'].map((item) => (
          <li key={item} className="pl-4 border-l-2" style={{ borderColor: 'var(--accent-light)' }}>
            {item}
          </li>
        ))}
      </ul>

      <h2 className="text-base pt-4" style={{ fontWeight: 400, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
        免責事項
      </h2>
      <p>
        本サイトに掲載している場所への立入は、法令・地権者の許可・安全性を必ずご確認ください。当サイトは不法侵入・危険行為を推奨するものではありません。掲載情報の正確性について万全を期していますが、その内容を保証するものではありません。
      </p>
    </PageLayout>
  );
}
