export default {
    mixins: [],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        prettifyXML(doc) {
            // Prettify an XML document using a XSL template.
            const xsltDocStr =
                // https://www.delightfulcomputing.com/xslfaq/xsl/sect2/pretty.html
                `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                    <xsl:output method="xml"/>
                    <xsl:param name="indent-increment" select="'    '" />
                    <xsl:template match="*">
                        <xsl:param name="indent" select="'&#xA;'"/>
                        <xsl:value-of select="$indent"/>
                        <xsl:copy>
                            <xsl:copy-of select="@*" />
                            <xsl:apply-templates>
                                <xsl:with-param name="indent"
                               select="concat($indent, $indent-increment)"/>
                            </xsl:apply-templates>
                            <xsl:if test="*">
                                <xsl:value-of select="$indent"/>
                            </xsl:if>
                        </xsl:copy>
                    </xsl:template>
                    <xsl:template match="comment()|processing-instruction()">
                        <xsl:copy />
                    </xsl:template>
                    <!-- WARNING: this is dangerous. Handle with care -->
                    <xsl:template match="text()[normalize-space(.)='']"/>
                </xsl:stylesheet>`;
            const xsltDoc = (new DOMParser()).parseFromString(xsltDocStr, "application/xml");
            const xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsltDoc);

            const resultDoc = xsltProcessor.transformToDocument(doc);
            return (new XMLSerializer()).serializeToString(resultDoc);
        },
        displayNice(data, responseFormatMimeType) {
            if (data === undefined) {
                return '';
            } else {
                switch(responseFormatMimeType) {
                    case 'application/json':
                        return JSON.stringify(data, null, 4);
                    case 'application/xml':
                        const doc = (new DOMParser()).parseFromString(data, "application/xml");
                        const result = this.prettifyXML(doc).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        return result;
                    case 'text/csv':
                        return data;
                    default:
                        return 'Unknown response format: ' + responseFormatMimeType;
                }
            }
        }
    },
    computed: {
    },
    watch: {
    }
}