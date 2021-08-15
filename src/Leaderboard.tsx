import React, { useState, useEffect } from 'react'
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'
import { TableFooter, TableSortLabel, TextField } from '@material-ui/core'
import LinearProgress from '@material-ui/core/LinearProgress'
const baseUri = 'https://shrouded-brook-65474.herokuapp.com'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
})

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    body: {
      fontSize: 14,
    },
  }),
)(TableCell)

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      height: 14
    },
  }),
)(TableRow)

interface Row {
  Name: string,
  Rank: number,
  Year: number,
  Platform: string,
  Genre: string,
  Publisher: string,
  Global_Sales: string,
  _id: string
}

interface Rows extends Array<Row> { }

type Order = 'asc' | 'desc'
var timerId: any

export default function BasicTable() {
  const classes = useStyles()
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState('Rank')
  const [page, setPage] = useState(0)
  const [limit, setlimit] = useState(9)
  const [rows, setrows] = useState<Rows>([])
  const [loading, setloading] = useState(false)
  const [totalPage, settotalPage] = useState(1)
  const [searched, setSearched] = useState('')
  const [updatedRow, setUpdatedRow] = useState<Row>()

  const debounceFunction = (func: Function, delay: number) => {
    // Cancels the setTimeout method execution
    clearTimeout(timerId)
    // Executes the func after delay time.
    timerId = setTimeout(func, delay)
  }

  const headCells = [
    { id: 'Rank', label: 'Rank' },
    { id: 'Name', label: 'Name' },
    { id: 'Publisher', label: 'Publisher' },
    { id: 'Platform', label: 'Platform' },
    { id: 'Year', label: 'Year' },
    { id: 'Genre', label: 'Genre' },
    { id: 'Global_Sales', label: 'Global_Sales' },
  ]

  useEffect(() => {
    debounceFunction(getGames, 500)
  }, [page, orderBy, order, limit, searched])

  const getGames = () => {
    setloading(true)
    const search = searched ? `&search=${searched}` : ''
    fetch(`${baseUri}/games?page=${page + 1}&limit=${limit}&orderBy=${orderBy}&order=${order === 'asc' ? 1 : -1}${search}`)
      .then(response => response.json())
      .then(data => {
        setrows(data.games)
        settotalPage(data.totalPages)
        setloading(false)
      })
  }

  const updateGames = (row: Row) => {
    const innerFunc = () => {
      fetch(`${baseUri}/update/${row._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...row })
      })
        .then(response => response.json())
        .then(data => {
          //console.log(data)
        }).then(
          getGames
        )
    }
    return innerFunc
  }
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const editRow = (updatedValue: string, property: string, row: Row) => {
    const data = rows.map(item => {
      if (item._id === row._id) {
        return { ...item, [property]: updatedValue }
      }
      return item
    })
    setrows(data)
    const updateInnerFun = updateGames({ ...row, [property]: updatedValue })
    debounceFunction(updateInnerFun, 500)
  }


  const sortTable = (headCellId: string) => {
    if (headCellId === orderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    }
    setOrderBy(headCellId)
  }

  if (loading) {
    return <LinearProgress />
  }

  return (
    <>
      <form noValidate autoComplete="off">
        <TextField id='standard-basic' label='Search'
          variant='outlined'
          style={{ width: '50%', margin: '10px' }}
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
        />
      </form>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label='simple table'>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <StyledTableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  size={'medium'}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => sortTable(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <span className={classes.visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.map((row) => (
              <StyledTableRow key={row._id}>
                <TableCell component='th' scope='row' width='5%' size={'small'}>
                  <input className='editable-input' value={row.Rank} onChange={(e) => editRow(e.target.value, 'Rank', row)} />
                </TableCell>
                <TableCell width='30%' size={'small'}>
                  <input className='editable-input' value={row.Name} onChange={(e) => editRow(e.target.value, 'Name', row)} />
                </TableCell>
                <TableCell width='30%'>
                  <input className='editable-input' value={row.Publisher} onChange={(e) => editRow(e.target.value, 'Publisher', row)} />
                </TableCell>
                <TableCell width='10%'>
                  <input className='editable-input' value={row.Platform} onChange={(e) => editRow(e.target.value, 'Platform', row)} />
                </TableCell>
                <TableCell width='10%'>
                  <input className='editable-input' value={row.Year} onChange={(e) => editRow(e.target.value, 'Year', row)} />
                </TableCell>
                <TableCell width='10%'>
                  <input className='editable-input' value={row.Genre} onChange={(e) => editRow(e.target.value, 'Genre', row)} />
                </TableCell>
                <TableCell width='5%'>
                  <input className='editable-input' value={row.Global_Sales} onChange={(e) => editRow(e.target.value, 'Global_Sales', row)} />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[9]}
                count={(totalPage * limit) === -1 ? 1 * limit + 1 : totalPage * limit}
                rowsPerPage={limit}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={(e) => console.log(e)}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  )
}
