import * as React from 'react';
import * as d3 from "d3";
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import OverlappingChart from './OverlappingChart';
import SvgIcon from '@mui/material/SvgIcon';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { PlotTooltip } from '../PlotTooltip';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator, selectedValues) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const aSelected = selectedValues.includes(a[0].id);
    const bSelected = selectedValues.includes(b[0].id);

    // Priorize elementos selecionados
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'delta_v', numeric: true, disablePadding: false, label: 'Del' },
  { id: 'duration', numeric: false, disablePadding: false, label: 'Dur' },
  { id: 'poc', numeric: true, disablePadding: false, label: 'PoC' },
  { id: 'miss_distance', numeric: true, disablePadding: false, label: 'MD' },
  { id: 'fuel_consumption', numeric: true, disablePadding: false, label: 'FC' },
];

function EnhancedTableHead(props) {
  const { order, orderBy, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={'none'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ padding: "0", width: "36px", fontSize: "10px", borderTop: "1px solid rgba(224, 224, 224, 1)", borderBottom: "none", color: "unset" }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={true}
              sx={{ height: "28px", ".MuiTableSortLabel-icon": { fontSize: "12px", marginLeft: "1px", marginRight: "0" } }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function OverlappingTable({ manoeuvres, overlappingIDs, theme, selectedValues, handleSelectedChange }) {

  // Filtrar manoeuvres baseado nos IDs de overlappingIDs
  const filteredManoeuvres = manoeuvres.filter(manoeuvre => overlappingIDs.includes(manoeuvre.id));
  const selectedOverlapping = filteredManoeuvres.filter(item => selectedValues.includes(item.id))

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState(selectedValues || []);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(filteredManoeuvres.length);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    handleSelectedChange(newSelected);
  };

  // Função para alternar a visibilidade da tabela
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredManoeuvres.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(filteredManoeuvres, getComparator(order, orderBy), selectedValues).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage, selectedValues, filteredManoeuvres],
  );

  const hoveredRowData = hoveredRow !== null ? manoeuvres.find(row => row.id === hoveredRow) : null;

  var tcaColor = d3.scaleSequential().domain(d3.extent(manoeuvres, function (d) { return d.tca; })).range(["#FF16FF", "#30E1F1"])

  const [isRightAligned, setIsRightAligned] = useState(true);
  const [isFirstHover, setIsFirstHover] = useState(true);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (hoveredRowData !== null && tooltipRef.current && isFirstHover) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      // Se o tooltip estiver muito à direita da janela, reposicione-o para a esquerda
      if (tooltipRect.right > windowWidth) {
        setIsRightAligned(false);
      } else {
        setIsRightAligned(true);
      }

      // Atualiza o estado para indicar que o alinhamento já foi definido
      setIsFirstHover(false);
    }
  }, [hoveredRowData, isFirstHover]);

  return (
    <Box sx={{ width: '190px', transform: isTableVisible ? 'translateY(40px)' : 'translateY(230px)', transition: 'transform 0.3s ease-in-out' }}>
      <Paper sx={{ width: '190px', overflow: 'hidden', backgroundColor: theme.palette.primary.main, mb: 2 }}>
        <TableContainer sx={{ maxHeight: 218, position: "relative", scrollbarWidth: "none" }}>
          <Box className="overlapping" onClick={toggleTableVisibility} sx={{ width: '190px', height: "28px", backgroundColor: theme.palette.primary.main, borderBottom: "1px solid rgba(224, 224, 224, 1)", display: "flex", alignItems: "center", justifyContent: "center", columnGap: "2px", position: "sticky", top: 0, cursor: "pointer", paddingLeft: "2px" }}>
            {selectedOverlapping.length > 1 ? (
              <Tooltip title="There are several overlapping manoeuvres at the same time, select just one for simulation" placement='top' arrow>
                <SvgIcon sx={{ fontSize: "16px", color: "#FFB300" }}>
                  <WarningIcon />
                </SvgIcon>
              </Tooltip>
            ) : (
              <Tooltip title="There are several overlapping manoeuvres at the same time, check here if you want to change the manoeuvre selected for simulation" placement='top' arrow>
                <SvgIcon sx={{ fontSize: "16px", color: "#25DB61" }}>
                  <CheckCircleRoundedIcon />
                </SvgIcon>
              </Tooltip>
            )}
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: theme.palette.text.primary }}>Overlapping Manoeuvres</Typography>
            {isTableVisible ? (
              <SvgIcon sx={{ fontSize: "20px", color: theme.palette.primary.darkGrey, marginLeft: "-4px", marginTop: "2px" }}>
                <KeyboardArrowDownRoundedIcon />
              </SvgIcon>
            ) : (
              <SvgIcon sx={{ fontSize: "20px", color: theme.palette.primary.darkGrey, marginLeft: "-4px", marginTop: "1px" }}>
                <KeyboardArrowUpRoundedIcon />
              </SvgIcon>
            )}

          </Box>

          {isTableVisible && (

            <><Table
              sx={{ minWidth: "190px" }}
              aria-labelledby="tableTitle"
              stickyHeader
            >
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      onMouseEnter={() => setHoveredRow(row.id)} // Atualiza estado de hover
                      onMouseLeave={() => setHoveredRow(null)} // Limpa estado de hover
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer', width: "190px", minWidth: "190px", maxWidth: "190px", height: '40px', minHeight: '40px', maxHeight: '40px' /*, "&.Mui-selected": { backgroundColor: theme.palette.primary.active, "&:hover": { backgroundColor: theme.palette.primary.active, opacity: "0.9" } }*/, "&:hover": {} }}
                    >
                      <TableCell align="center" sx={{ padding: "0", width: "36px", minWidth: "36px", maxWidth: "36px", height: "40px", minHeight: "40px", maxHeight: "40px", lineHeight: 0 }}>
                        <OverlappingChart
                          fullData={manoeuvres}
                          data={row.delta_v}
                          label={'delta_v'}
                          theme={theme}
                          isHovered={hoveredRow === row.id} // Passa estado de hover
                          isSelected={isItemSelected} // Passa o estado selecionado
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ padding: "0", width: "36px", minWidth: "36px", maxWidth: "36px", height: "40px", minHeight: "40px", maxHeight: "40px", lineHeight: 0 }}>
                        <OverlappingChart
                          fullData={manoeuvres}
                          data={row.duration}
                          label={'duration'}
                          theme={theme}
                          isHovered={hoveredRow === row.id} // Passa estado de hover
                          isSelected={isItemSelected} // Passa o estado selecionado
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ padding: "0", width: "36px", minWidth: "36px", maxWidth: "36px", height: "40px", minHeight: "40px", maxHeight: "40px", lineHeight: 0 }}>
                        <OverlappingChart
                          fullData={manoeuvres}
                          data={row.poc}
                          label={'poc'}
                          theme={theme}
                          isHovered={hoveredRow === row.id} // Passa estado de hover
                          isSelected={isItemSelected} // Passa o estado selecionado
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ padding: "0", width: "36px", minWidth: "36px", maxWidth: "36px", height: "40px", minHeight: "40px", maxHeight: "40px", lineHeight: 0 }}>
                        <OverlappingChart
                          fullData={manoeuvres}
                          data={row.miss_distance}
                          label={'miss_distance'}
                          theme={theme}
                          isHovered={hoveredRow === row.id} // Passa estado de hover
                          isSelected={isItemSelected} // Passa o estado selecionado
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ padding: "0", width: "36px", minWidth: "36px", maxWidth: "36px", height: "40px", minHeight: "40px", maxHeight: "40px", lineHeight: 0 }}>
                        <OverlappingChart
                          fullData={manoeuvres}
                          data={row.fuel_consumption}
                          label={'fuel_consumption'}
                          theme={theme}
                          isHovered={hoveredRow === row.id} // Passa estado de hover
                          isSelected={isItemSelected} // Passa o estado selecionado
                        />
                      </TableCell>
                    </TableRow>

                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: 40 * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>

            </Table><Table
              sx={{
                position: 'sticky',
                bottom: 0,
                width: '190px',
                backgroundColor: theme.palette.primary.main,
                "& .MuiTableHead-root": { color: theme.palette.primary.darkGrey }
              }}
              aria-labelledby="tableFooter"
              size={'medium'}
            >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={filteredManoeuvres.length} />
              </Table></>
          )}
        </TableContainer>
        {/* Renderiza o PlotTooltip fora da tabela, usando os dados da linha hoverada */}
        {hoveredRowData !== null && (
          <Box
            ref={tooltipRef}
            sx={{
              position: 'absolute',
              left: isRightAligned ? 'calc(100% + 10px)' : 'auto',
              right: !isRightAligned ? 'calc(100% + 10px)' : 'auto',
              top: '50%', // Ajuste conforme necessário
              transform: 'translateY(-50%)', // Centraliza verticalmente
              zIndex: 999, // Ajuste conforme necessário
            }}
          >
            <PlotTooltip
              manoeuvres={manoeuvres}
              tcaColor={tcaColor(hoveredRowData.tca)}
              manTime={hoveredRowData.man_time}
              tca={hoveredRowData.time_to_tca}
              tcaValue={hoveredRowData.tca}
              type={hoveredRowData.type}
              delta_v={hoveredRowData.delta_v}
              duration={hoveredRowData.duration}
              poc={hoveredRowData.poc}
              miss_distance={hoveredRowData.miss_distance}
              fuel_consumption={hoveredRowData.fuel_consumption}
              theme={theme}
            />
          </Box>
        )}
      </Paper>
      <Box sx={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: `10px solid ${theme.palette.primary.main}`, position: "absolute", left: "88px", top: isTableVisible ? "217px" : "27px" }}>
      </Box>
    </Box>
  );
}
