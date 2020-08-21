let defaultContent = "<label class=\"label-no-data\">no data</label>";

export const DISPLAY_GROUP_TAXON_IDENTIFICATION = "taxon-identification";
export const DISPLAY_GROUP_TAXON_HIERARCHY_0 = "taxon-hierarchy-0";
export const DISPLAY_GROUP_TAXON_HIERARCHY_1 = "taxon-hierarchy-1";
export const DISPLAY_GROUP_TAXON_HIERARCHY_2 = "taxon-hierarchy-2";

export const DISPLAY_GROUP_LABEL_TAXON_IDENTIFICATION = "Taxon Identification";
export const DISPLAY_GROUP_LABEL_TAXON_HIERARCHY = "Taxon Hierarchy";

const columnDefs = [
  {
    title: "Taxon ID",
    queryName: "taxonID",
    data: "taxonID",
    visible: true,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Accepted Taxon ID",
    queryName: "acceptedTaxonID",
    data: "acceptedTaxonID",
    visible: true,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Scientific Name",
    queryName: "scientificName",
    data: "dwc:scientificName",
    visible: true,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Scientific Name Authorship",
    queryName: "scientificNameAuthorship",
    data: "dwc:scientificNameAuthorship",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Source Reference",
    queryName: "nameAccordingToTitle",
    data: "dwc:nameAccordingToTitle",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Taxon Rank",
    queryName: "taxonRank",
    data: "dwc:taxonRank",
    visible: true,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Taxon Protocol Category",
    queryName: "taxonProtocolCategory",
    data: "taxonProtocolCategory",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Vernacular Name",
    queryName: "vernacularName",
    data: "dwc:vernacularName",
    visible: true,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_IDENTIFICATION
  },
  {
    title: "Kingdom",
    queryName: "kingdom",
    data: "dwc:kingdom",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Subkingdom",
    queryName: "subkingdom",
    data: "gbif:subkingdom",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Infrakingdom",
    queryName: "infrakingdom",
    data: "gbif:iubkingdom",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
      title: "Superdivision",
      queryName: "superdivision",
      data: "gbif:superdivision",
      visible: false,
      defaultContent: defaultContent,
      columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Division",
    queryName: "division",
    data: "gbif:division",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Subdivision",
    queryName: "subdivision",
    data: "gbif:subdivision",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Infradivision",
    queryName: "infradivision",
    data: "gbif:infradivision",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Parvdivision",
    queryName: "parvdivision",
    data: "gbif:parvdivision",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Superphylum",
    queryName: "superphylum",
    data: "gbif:superphylum",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Phylum",
    queryName: "phylum",
    data: "dwc:phylum",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Subphylum",
    queryName: "subphylum",
    data: "gbif:subphylum",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Infraphylum",
    queryName: "infraphylum",
    data: "gbif:infraphylum",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_0
  },
  {
    title: "Superclass",
    queryName: "superclass",
    data: "gbif:superclass",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Class",
    queryName: "class",
    data: "dwc:class",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Subclass",
    queryName: "subclass",
    data: "gbif:subclass",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Infraclass",
    queryName: "infraclass",
    data: "gbif:infraclass",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Superorder",
    queryName: "superorder",
    data: "gbif:superorder",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Order",
    queryName: "order",
    data: "dwc:order",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Suborder",
    queryName: "suborder",
    data: "gbif:suborder",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Infraorder",
    queryName: "infraorder",
    data: "gbif:infraorder",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Section",
    queryName: "section",
    data: "gbif:section",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Subsection",
    queryName: "subsection",
    data: "gbif:subsection",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Superfamily",
    queryName: "superfamily",
    data: "gbif:superfamily",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Family",
    queryName: "family",
    data: "dwc:family",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Subfamily",
    queryName: "subfamily",
    data: "gbif:subfamily",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_1
  },
  {
    title: "Tribe",
    queryName: "tribe",
    data: "gbif:tribe",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Subtribe",
    queryName: "subtribe",
    data: "gbif:subtribe",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Genus",
    queryName: "genus",
    data: "dwc:genus",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Subgenus",
    queryName: "subgenus",
    data: "dwc:subgenus",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Subspecies",
    queryName: "subspecies",
    data: "gbif:subspecies",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
      title: "Variety",
      queryName: "variety",
      data: "gbif:variety",
      visible: false,
      defaultContent: defaultContent,
      columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Subvariety",
    queryName: "subvariety",
    data: "gbif:subvariety",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Form",
    queryName: "form",
    data: "gbif:form",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Subform",
    queryName: "subform",
    data: "gbif:subform",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Species Group",
    queryName: "speciesGroup",
    data: "speciesGroup",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Specific Epithet",
    queryName: "specificEpithet",
    data: "dwc:specificEpithet",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  },
  {
    title: "Infraspecific Epithet",
    queryName: "infraspecificEpithet",
    data: "dwc:infraspecificEpithet",
    visible: false,
    defaultContent: defaultContent,
    columnDisplayGroup: DISPLAY_GROUP_TAXON_HIERARCHY_2
  }
];

/**
 * Gets a copy of the column definitions
 */
export const getColumns = () => {
  return columnDefs.map((value) => {
    return {
      ...value
    }
  });
}

/**
 * Gets the display label for the display group
 * @param {*} columnDisplayGroup
 */
export const getColumnDisplayGroupLabel = (columnDisplayGroup) => {
  switch (columnDisplayGroup) {
    case DISPLAY_GROUP_TAXON_IDENTIFICATION:
      return DISPLAY_GROUP_LABEL_TAXON_IDENTIFICATION;
    case DISPLAY_GROUP_TAXON_HIERARCHY_0:
    case DISPLAY_GROUP_TAXON_HIERARCHY_1:
    case DISPLAY_GROUP_TAXON_HIERARCHY_2:
      return DISPLAY_GROUP_LABEL_TAXON_HIERARCHY;
    default:
        break;
  }

  return null;
}
