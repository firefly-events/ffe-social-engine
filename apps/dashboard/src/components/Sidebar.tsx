
import Link from 'next/link';

export default function Sidebar() {
  const navItems = [
    { name: 'Live Status', href: '/status' },
    { name: 'Cycle History', href: '/history' },
    { name: 'Cost Tracking', href: '/cost' },
    { name: 'Queue Visualization', href: '/queue' },
    { name: 'Agent Logs', href: '/logs' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-6">Dashboard</div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link href={item.href} className="block hover:bg-gray-700 p-2 rounded">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
