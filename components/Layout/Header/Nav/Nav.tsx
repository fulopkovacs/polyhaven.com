import { useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0';
import locales from 'utils/locales'

import { MdMenu, MdExpandLess, MdAccountCircle } from 'react-icons/md'
import { IoMdLogIn } from 'react-icons/io';

import NavItem from './NavItem'
import LocaleFlag from 'components/Layout/Header/Nav/LocaleFlag';

import styles from './Nav.module.scss'

const Nav = () => {
  const router = useRouter()
  const { user, isLoading } = useUser();
  const [navHide, setToggle] = useState(true);

  const toggle = () => {
    setToggle(!navHide)
  }

  return (
    <>
      <div className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`} onClick={() => { setToggle(true) }}>
        <NavItem text="Assets" link="/all">
          <NavItem text="HDRIs" link="/hdris" />
          <NavItem text="Textures" link="/textures" />
          <NavItem text="Models" link="/models" />
        </NavItem>
        <NavItem text="Gallery" link="/gallery" />
        <NavItem text="Support Us" link="https://www.patreon.com/polyhaven/overview" />
        <NavItem text="About/Contact" link="/about-contact">
          <NavItem text="License" link="/license" />
          <NavItem text="News" link="https://www.patreon.com/polyhaven/posts?public=true" />
          <NavItem text="Blog" link="https://blog.polyhaven.com" />
          <NavItem text="FAQ" link="/faq" />
        </NavItem>

        {user ?
          <NavItem text={<MdAccountCircle />} link="/account">
            <NavItem text="Logout" link="/api/auth/logout" />
          </NavItem>
          :
          <NavItem text={<IoMdLogIn />} link={`/account?returnTo=${router.asPath}`} />
        }
      </div>

      <div style={{ height: '100%', display: 'flex' }}>
        <NavItem text={<LocaleFlag locale={router.locale} flag={locales[router.locale].flag} />}>
          {Object.keys(locales).map(l =>
            <NavItem key={l} text={<LocaleFlag locale={l} flag={locales[l].flag} name={locales[l].name} />} link={router.asPath} locale={l} />
          )}
        </NavItem>
      </div>

      <div className={styles.menuToggle} onClick={toggle}>{navHide ? <MdMenu /> : <MdExpandLess />}</div>
    </>
  )
}

export default Nav
