import { connect } from "react-redux";
import DownloadPresentation from "../presentations/DownloadPresentation";

const mapStateToProps = (state) => ({
  taxonQuery: state.taxonQuery,
});

const mapDispatchToProps = () => ({
});

const DownloadContainer = connect(mapStateToProps, mapDispatchToProps)(DownloadPresentation);

export default DownloadContainer;
