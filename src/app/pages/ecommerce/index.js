import { BWAAccountCard, BWAHelpCard } from "@app/components/molecules";
import { BWACommonTemplate } from "@app/components/templates";
import { Modal } from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";
import { useParams, useNavigate } from "react-router-dom";

import "@newfold-labs/wp-module-ecommerce/bluehost.css";
import "@newfold-labs/wp-module-ecommerce/styles.scss";
import "@newfold-labs/wp-module-ecommerce";
import "./styles.scss";
import MarketplaceLite from '../../../../vendor/newfold-labs/wp-module-marketplace/components/marketplaceLite/';

const NewfoldECommerce = window.NewfoldECommerce;

function EcommercePage() {
  const navigate = useNavigate();
  let brandPluginState = useSelect((select) => {
    let store = select("bluehost/plugin");
    return {
      comingSoon: store.getSetting("comingSoon"),
      capabilities: store.getEcommerceCapabilities()
    };
  });
  let { section } = useParams();
  const eCommerceState = { wp: brandPluginState };
  const { toggleSetting } = useDispatch("bluehost/plugin");
  const eCommerceActions = {
    toggleComingSoon: async () => toggleSetting("comingSoon"),
  };
  const wpModules = {
    Modal,
    navigate,
    MarketplaceLite,
  };
  return (
    <BWACommonTemplate>
      <NewfoldECommerce
        state={eCommerceState}
        actions={eCommerceActions}
        wpModules={wpModules}
        section={section}
      />
      <div className="grid-col-2">
        <BWAAccountCard />
        <BWAHelpCard />
      </div>
    </BWACommonTemplate>
  );
}

export default EcommercePage;
