import { TruckIcon, PackageIcon, ArrowLeftIcon } from '../Icons'

export default function DriverSidebar() {
  return (
    <aside className="agent-sidebar">
      <div className="sidebar-brand">
        <TruckIcon size={22}/>
        <span>DeliverIt</span>
      </div>
      <div className="sidebar-role">Driver Portal</div>
      <nav className="sidebar-nav">
        <button className="sidebar-link sidebar-active">
          <PackageIcon size={16}/> My Deliveries
        </button>
      </nav>
      <div className="sidebar-footer">
        <a href="/" className="sidebar-link">
          <ArrowLeftIcon size={15}/> Back to Website
        </a>
      </div>
    </aside>
  )
}
