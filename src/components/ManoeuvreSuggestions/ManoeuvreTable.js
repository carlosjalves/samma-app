import * as React from 'react';
import * as d3 from "d3";
import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import Checkbox from '@mui/material/Checkbox';

import IconButton from '@mui/material/IconButton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';

import { manoeuvresList } from '../../assets/mappers';
import { formatNumber } from '../../assets/mappers';

function descendingComparator(a, b, orderBy) {
  // Função para acessar os valores com base em um caminho aninhado
  const getValueByPath = (obj, path) => path.split('.').reduce((acc, key) => acc[key], obj);

  // Comparação usando caminhos aninhados
  const orderByValueA = getValueByPath(a, orderBy);
  const orderByValueB = getValueByPath(b, orderBy);

  if (orderByValueB < orderByValueA) {
    return -1;
  }
  if (orderByValueB > orderByValueA) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Manoeuvre Type' },
  { id: 'man_time', numeric: false, disablePadding: false, label: 'Manoeuvring Time' },
  { id: 'delta_v', numeric: true, disablePadding: false, label: 'Total Delta V' },
  { id: 'duration', numeric: false, disablePadding: false, label: 'Duration [s]' },
  { id: 'poc', numeric: true, disablePadding: false, label: 'PoC' },
  { id: 'miss_distance', numeric: true, disablePadding: false, label: 'Miss Distance [m]' },
  { id: 'fuel_consumption', numeric: true, disablePadding: false, label: 'Fuel Consumption [g]' },
];

const typePath = (type) => {

  if (type === "impulsive") {
    return "M 0 14 h 16 L 8 0 z z z";
  }
  if (type === "thrust") {
    return "M 0 0 H 14 V 14 H 0 L 0 0";
  }
  if (type === "differential_drag") {
    return "M 0 9 L 9 18 L 18 9 L 9 0 L 0 9";
  }
}

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, onRequestSort, rowCount, isIdVisible, setIsIdVisible } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const createSeeIDHandler = (property) => (event) => {
    setIsIdVisible(!isIdVisible)
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding="checkbox"
          sx={{
            paddingLeft: "20px",
            paddingRight: "10px"
          }}
        >
          {/*
          <Checkbox
            color="default"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all manoeuvres',
            }}
            sx={(theme) => ({
              color: theme.palette.primary.darkGrey,

              "& .MuiSvgIcon-root": {
                color: theme.palette.primary.darkGrey,
              },
            })}
          />
        */}
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            size={'small'}
            key={headCell.id}
            align={(headCell.id !== "id") ? 'center' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              paddingLeft: (headCell.id !== "id") ? '14px' : '22px'

            }}
          >
            {headCell.id !== "id" && (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.id === "man_time" ? (
                  <>
                    <span style={{ textAlign: "left" }}>
                      {headCell.label}
                      <br />
                      <span style={{ color: "#767689", fontSize: "13px", fontWeight: 500 }}>
                        Time to TCA
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </>
                )}
              </TableSortLabel>
            )}
            {headCell.id === "id" && (
              <TableSortLabel
                active={true}
                onClick={createSeeIDHandler(headCell.id)}
                IconComponent={isIdVisible ? VisibilityOffIcon : VisibilityIcon}
                sx={{ paddingLeft: "8px" }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}

          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function ManoeuvreTable({ conjunctionID, selectedValues, handleSelectedChange, switchState }) {

  const { t } = useTranslation("labels");
  const theme = useTheme();

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('man_time');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [orderedItems, setOrderedItems] = React.useState([]);

  const manoeuvres = React.useMemo(() => {
    return manoeuvresList.items.filter(item => item.conjunction_id === conjunctionID);
  }, [manoeuvresList, conjunctionID]);
  //const data = manoeuvresList.items;
  var tcaColor = d3.scaleSequential().domain(d3.extent(manoeuvres, function (d) { return d.tca; })).range(["#FF1760", "#30E1F1"])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = manoeuvres.map((n) => n.id);
      handleSelectedChange(newSelected);
      return;
    }
    handleSelectedChange([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selectedValues.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedValues, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedValues.slice(1));
    } else if (selectedIndex === selectedValues.length - 1) {
      newSelected = newSelected.concat(selectedValues.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedValues.slice(0, selectedIndex),
        selectedValues.slice(selectedIndex + 1),
      );
    }
    handleSelectedChange(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedValues.indexOf(id) !== -1;

  React.useEffect(() => {
    const newOrderedItems = [...manoeuvres].sort((a, b) => {
      const aSelected = selectedValues.includes(a.id);
      const bSelected = selectedValues.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
    setOrderedItems(newOrderedItems);
  }, [selectedValues, manoeuvres]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - manoeuvres.length) : 0;

  const sortedRows = React.useMemo(() => {
    return stableSort(orderedItems, getComparator(order, orderBy));
  }, [orderedItems, order, orderBy]);

  const visibleRows = React.useMemo(() => {
    const selectedRows = sortedRows.filter(item => selectedValues.includes(item.id));
    const unselectedRows = sortedRows.filter(item => !selectedValues.includes(item.id));
    const currentUnselectedRows = unselectedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage - selectedRows.length);

    return [...selectedRows, { separator: true }, ...currentUnselectedRows];
  }, [sortedRows, selectedValues, page, rowsPerPage]);

  const [visibleId, setVisibleId] = useState(null); // Estado para controlar o ID visível
  const [isIdVisible, setIsIdVisible] = useState(false);
  const [activeCellId, setActiveCellId] = useState(null);

  const colorMap = {
    duration: [theme.palette.heatmap.first, theme.palette.heatmap.second, theme.palette.heatmap.third, theme.palette.heatmap.forth, theme.palette.heatmap.fifth],
    poc: [theme.palette.heatmap.first, theme.palette.heatmap.second, theme.palette.heatmap.third, theme.palette.heatmap.forth, theme.palette.heatmap.fifth],
    miss_distance: [theme.palette.heatmap.first, theme.palette.heatmap.second, theme.palette.heatmap.third, theme.palette.heatmap.forth, theme.palette.heatmap.fifth],
    fuel_consumption: [theme.palette.heatmap.first, theme.palette.heatmap.second, theme.palette.heatmap.third, theme.palette.heatmap.forth, theme.palette.heatmap.fifth],
    delta_v: [theme.palette.heatmap.first, theme.palette.heatmap.second, theme.palette.heatmap.third, theme.palette.heatmap.forth, theme.palette.heatmap.fifth],
  };

  const relativeColorMap = {
    duration: [theme.palette.relative_heatmap.first, theme.palette.relative_heatmap.second, theme.palette.relative_heatmap.third, theme.palette.relative_heatmap.forth, theme.palette.relative_heatmap.fifth],
    poc: [theme.palette.relative_heatmap.first, theme.palette.relative_heatmap.second, theme.palette.relative_heatmap.third, theme.palette.relative_heatmap.forth, theme.palette.relative_heatmap.fifth],
    miss_distance: [theme.palette.relative_heatmap.first, theme.palette.relative_heatmap.second, theme.palette.relative_heatmap.third, theme.palette.relative_heatmap.forth, theme.palette.relative_heatmap.fifth],
    fuel_consumption: [theme.palette.relative_heatmap.first, theme.palette.relative_heatmap.second, theme.palette.relative_heatmap.third, theme.palette.relative_heatmap.forth, theme.palette.relative_heatmap.fifth],
    delta_v: [theme.palette.relative_heatmap.first, theme.palette.relative_heatmap.second, theme.palette.relative_heatmap.third, theme.palette.relative_heatmap.forth, theme.palette.relative_heatmap.fifth],
  };

  const textColorMap = {
    duration: [theme.palette.heatmap.text.first, theme.palette.heatmap.text.second, theme.palette.heatmap.text.third, theme.palette.heatmap.text.forth, theme.palette.heatmap.text.fifth],
    poc: [theme.palette.heatmap.text.first, theme.palette.heatmap.text.second, theme.palette.heatmap.text.third, theme.palette.heatmap.text.forth, theme.palette.heatmap.text.fifth],
    miss_distance: [theme.palette.heatmap.text.first, theme.palette.heatmap.text.second, theme.palette.heatmap.text.third, theme.palette.heatmap.text.forth, theme.palette.heatmap.text.fifth],
    fuel_consumption: [theme.palette.heatmap.text.first, theme.palette.heatmap.text.second, theme.palette.heatmap.text.third, theme.palette.heatmap.text.forth, theme.palette.heatmap.text.fifth],
    delta_v: [theme.palette.heatmap.text.first, theme.palette.heatmap.text.second, theme.palette.heatmap.text.third, theme.palette.heatmap.text.forth, theme.palette.heatmap.text.fifth],
  };

  const textRelativeColorMap = {
    duration: [theme.palette.relative_heatmap.text.first, theme.palette.relative_heatmap.text.second, theme.palette.relative_heatmap.text.third, theme.palette.relative_heatmap.text.forth, theme.palette.relative_heatmap.text.fifth],
    poc: [theme.palette.relative_heatmap.text.first, theme.palette.relative_heatmap.text.second, theme.palette.relative_heatmap.text.third, theme.palette.relative_heatmap.text.forth, theme.palette.relative_heatmap.text.fifth],
    miss_distance: [theme.palette.relative_heatmap.text.first, theme.palette.relative_heatmap.text.second, theme.palette.relative_heatmap.text.third, theme.palette.relative_heatmap.text.forth, theme.palette.relative_heatmap.text.fifth],
    fuel_consumption: [theme.palette.relative_heatmap.text.first, theme.palette.relative_heatmap.text.second, theme.palette.relative_heatmap.text.third, theme.palette.relative_heatmap.text.forth, theme.palette.relative_heatmap.text.fifth],
    delta_v: [theme.palette.relative_heatmap.text.first, theme.palette.relative_heatmap.text.second, theme.palette.relative_heatmap.text.third, theme.palette.relative_heatmap.text.forth, theme.palette.relative_heatmap.text.fifth],
  };

  const bestValues = {
    duration: [],
    poc: [],
    miss_distance: [],
    fuel_consumption: [],
    delta_v: [],
  };

  const bestRelativeValues = {
    duration: [],
    poc: [],
    miss_distance: [],
    fuel_consumption: [],
    delta_v: [],
  };

  const uniqueValues = {};
  const uniqueRelativeValues = {};

  const selectedItems = manoeuvres.filter(item => selectedValues.includes(item.id));
  const unselectedItems = manoeuvres.filter(item => !selectedValues.includes(item.id));

  if (switchState) {
    for (const key in bestValues) {
      if (key in bestValues) {
        uniqueValues[key] = new Set(manoeuvres.map(row => row[key]))
      }
    }
  } else {
    for (const key in bestValues) {
      if (key in bestValues) {
        uniqueValues[key] = new Set(unselectedItems.map(row => row[key]));
        uniqueRelativeValues[key] = new Set(selectedItems.map(row => row[key]));
      }
    }
  }

  if (!switchState) {
    bestRelativeValues.miss_distance = Array.from(uniqueRelativeValues.miss_distance)
      .sort(
        (a, b) => (b ?? Number.NEGATIVE_INFINITY) - (a ?? Number.NEGATIVE_INFINITY)
      )
      .slice(0, 5)

    for (const key of ["poc", "duration", "delta_v", "fuel_consumption"]) {
      bestRelativeValues[key] = Array.from(uniqueRelativeValues[key])
        .sort(
          (a, b) =>
            (a ?? Number.POSITIVE_INFINITY) - (b ?? Number.POSITIVE_INFINITY)
        )
        .slice(0, 5)
    }
  }

  bestValues.miss_distance = Array.from(uniqueValues.miss_distance)
    .sort(
      (a, b) => (b ?? Number.NEGATIVE_INFINITY) - (a ?? Number.NEGATIVE_INFINITY)
    )
    .slice(0, 5)

  for (const key of ["poc", "duration", "delta_v", "fuel_consumption"]) {
    bestValues[key] = Array.from(uniqueValues[key])
      .sort(
        (a, b) =>
          (a ?? Number.POSITIVE_INFINITY) - (b ?? Number.POSITIVE_INFINITY)
      )
      .slice(0, 5)
  }

  const handleIDClick = (id) => {
    // Define o ID visível com base no ID clicado
    setVisibleId(visibleId === id ? null : id);
  };

  const toggleIcon = (id) => {
    setActiveCellId(id === activeCellId ? null : id);
  };

  const copyIDToClipboard = (id) => {
    // Cria um novo elemento de input
    const el = document.createElement('textarea');
    // Define o valor do input como o ID que você quer copiar
    el.value = id;
    // Adiciona o input ao DOM
    document.body.appendChild(el);
    // Seleciona o conteúdo do input
    el.select();
    // Copia o conteúdo selecionado para a área de transferência
    document.execCommand('copy');
    // Remove o input do DOM
    document.body.removeChild(el);
  };

  const getCellColor = (id, value, variable) => {
    if (typeof value === 'undefined') {
      // Retorna uma cor para valores undefined
      return theme.palette.primary.main; // Por exemplo, uma cor cinza claro
    }
    if (variable in bestValues) {
      const bestVariableValues = bestValues[variable];
      const index = bestVariableValues.indexOf(value);
      if (index !== -1) {
        return colorMap[variable][index];
      }
    }
    if (variable in bestRelativeValues && selectedValues.includes(id)) {
      const bestVariableValues = bestRelativeValues[variable];
      const index = bestVariableValues.indexOf(value);
      if (index !== -1) {
        return relativeColorMap[variable][index];
      }
    }

    if (selectedValues.includes(id) && !switchState) return theme.palette.relative_heatmap.default;
    else return theme.palette.heatmap.default;
  };

  const getTextColor = (id, value, variable) => {
    if (typeof value === 'undefined') {
      // Retorna uma cor para valores undefined
      return theme.palette.text.primary;
    }
    if (variable in bestValues) {
      const bestVariableValues = bestValues[variable];
      const index = bestVariableValues.indexOf(value);
      if (index !== -1) {
        return textColorMap[variable][index];
      }
    }
    if (variable in bestRelativeValues && selectedValues.includes(id)) {
      const bestVariableValues = bestRelativeValues[variable];
      const index = bestVariableValues.indexOf(value);
      if (index !== -1) {
        return textRelativeColorMap[variable][index];
      }
    }

    if (selectedValues.includes(id) && !switchState) return theme.palette.relative_heatmap.text.default;
    else return theme.palette.heatmap.text.default;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={(theme) => ({ width: '100%', mb: 2, backgroundColor: theme.palette.primary.main, backgroundImage: "unset", boxShadow: "none" })}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              numSelected={selectedValues.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={manoeuvres.length}
              isIdVisible={isIdVisible}
              setIsIdVisible={setIsIdVisible}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                if (row.separator) {
                  return (
                    <TableRow key="separator" style={{ height: selectedValues.length > 0 ? '25px' : '0', backgroundColor: theme.palette.background }}>
                      <TableCell colSpan={9} style={{ padding: 0, borderBottom: 'none' }} />
                    </TableRow>
                  );
                }

                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                    sx={(theme) => ({
                      cursor: 'pointer',
                      backgroundColor: selectedValues.includes(row.id) ? theme.palette.heatmap.default : theme.palette.primary.main,
                      "&:hover #delta_v, &:hover #duration, &:hover #poc, &:hover #miss_distance, &:hover #fuel_consumption": {
                        opacity: 0.65,
                      }
                    })}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={(theme) => ({
                        paddingLeft: "20px"
                      })}
                    >
                      <Checkbox
                        color="default"
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        checked={isItemSelected}
                        selected={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                        sx={(theme) => ({
                          color: theme.palette.primary.darkGrey,

                          '&.Mui-checked': {
                            color: theme.palette.primary.active,
                          },
                        })}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      sx={{
                        alignItems: "center",
                        padding: "14px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                        minWidth: "104px"
                      }}
                    >
                      <Tooltip title="Show/Hide Manoeuvre ID" placement="top" arrow>
                        <IconButton sx={(theme) => ({ color: visibleId === row.id ? theme.palette.primary.active : theme.palette.primary.lightGrey, transition: "0.2s ease-in-out" })} onClick={() => handleIDClick(row.id)}>
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>

                      {activeCellId === row.id ? (
                        <Tooltip title="Copied" placement="top" arrow>
                          <IconButton
                            sx={(theme) => ({ color: theme.palette.primary.active, transition: "0.2s ease-in-out" })}
                            onClick={() => {
                              toggleIcon(row.id);
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill={theme.palette.primary.active}>
                              <path d="M 16 1 H 4 c -1.1 0 -2 0.9 -2 2 v 14 h 2 V 3 h 12 z m 3 4 H 8 c -1.1 0 -2 0.9 -2 2 v 14 c 0 1.1 0.9 2 2 2 h 11 c 1.1 0 2 -0.9 2 -2 V 7 c 0 -1.1 -0.9 -2 -2 -2 m -6 13 L 13 18 Z L 9 15 L 10 14 L 13 16 L 17 10 L 18 11 z" />
                            </svg>
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title="Copy ID to clipboard" placement="top" arrow>
                            <IconButton
                              sx={(theme) => ({ color: theme.palette.primary.lightGrey, transition: "0.2s ease-in-out" })}
                              onClick={() => {
                                copyIDToClipboard(row.id);
                                toggleIcon(row.id);
                              }}
                            >
                              <ContentCopyTwoToneIcon sx={(theme) => ({ fontSize: 22, color: theme.palette.primary.lightGrey, "path": { opacity: "1" } })} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {(isIdVisible || visibleId === row.id) &&
                        row.id}

                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: "13px", padding: "14px", whiteSpace: "nowrap", minWidth: "170px" }}
                    >
                      {row.type !== 'unknown' ? (
                        <>
                          {t(`type.${row.type}`)}
                          <svg viewBox="0 0 18 18" width="18" height="18" fill={theme.palette.type[row.type]} style={{ position: "relative", top: "5px", left: "5px" }}>
                            <path d={typePath(row.type)} />
                          </svg>
                        </>

                      ) : (
                        <>
                          <svg viewBox="0 0 16 16" width="16" height="16" fill='#FFB300' style={{ position: 'relative', top: '3.5px' }}>
                            <path d="M 0.64 13.44 h 14.08 L 7.68 1.28 z m 7.68 -1.92 h -1.28 v -1.28 h 1.28 z m 0 -2.56 h -1.28 v -2.56 h 1.28 z" />
                          </svg>
                          <span style={{ color: '#FFB300', marginLeft: "2px" }}>
                            Unknown
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: "13px", padding: "14px", whiteSpace: "nowrap", minWidth: "250px" }}
                    >
                      <span style={{ textAlign: "left" }}>
                        {row.man_time}
                        <br />
                        <span style={{ color: tcaColor(row.tca), fontWeight: 600 }}>
                          {row.time_to_tca} to TCA
                        </span>
                      </span>
                    </TableCell><Tooltip title={row.delta_v * 100} placement="top" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -38], }, },], }, }}>
                      <TableCell
                        id='delta_v'
                        align="center"
                        sx={{ fontSize: "13px", padding: "14px", minWidth: "180px", backgroundColor: getCellColor(row.id, row.delta_v, 'delta_v'), color: getTextColor(row.id, row.delta_v, 'delta_v') }}
                      >

                        {formatNumber(row.delta_v, "delta_v") ?? "-"}
                      </TableCell>
                    </Tooltip><Tooltip title={row.duration} placement="top" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -38], }, },], }, }}>
                      <TableCell
                        id='duration'
                        align="center"
                        sx={{ fontSize: "13px", padding: "14px", minWidth: "180px", backgroundColor: getCellColor(row.id, row.duration, 'duration'), color: getTextColor(row.id, row.duration, 'duration') }}
                      >
                        {formatNumber(row.duration) ?? "-"}
                      </TableCell>
                    </Tooltip><Tooltip title={row.poc} placement="top" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -38], }, },], }, }}>
                      <TableCell
                        id='poc'
                        align="center"
                        sx={{ fontSize: "13px", padding: "14px", minWidth: "180px", backgroundColor: getCellColor(row.id, row.poc, 'poc'), color: getTextColor(row.id, row.poc, 'poc') }}
                      >
                        {formatNumber(row.poc, "poc") ?? "-"}
                      </TableCell>
                    </Tooltip><Tooltip title={row.miss_distance} placement="top" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -38], }, },], }, }}>
                      <TableCell
                        id='miss_distance'
                        align="center"
                        sx={{ fontSize: "13px", padding: "14px", minWidth: "180px", backgroundColor: getCellColor(row.id, row.miss_distance, 'miss_distance'), color: getTextColor(row.id, row.miss_distance, 'miss_distance') }}
                      >
                        {formatNumber(row.miss_distance, "miss_distance") ?? "-"}
                      </TableCell>
                    </Tooltip><Tooltip title={row.fuel_consumption * 1000} placement="top" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -38], }, },], }, }}>
                      <TableCell
                        id='fuel_consumption'
                        align="center"
                        sx={{ fontSize: "13px", padding: "14px", minWidth: "180px", backgroundColor: getCellColor(row.id, row.fuel_consumption, 'fuel_consumption'), color: getTextColor(row.id, row.fuel_consumption, 'fuel_consumption') }}
                      >
                        {formatNumber(row.fuel_consumption, "fuel_consumption") ?? "-"}
                      </TableCell>
                    </Tooltip>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={manoeuvres.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
